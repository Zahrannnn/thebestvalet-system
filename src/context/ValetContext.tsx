import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getTicketPrice } from "@/constants/ticketPrices";

export type Ticket = {
  id: string;
  ticketNumber: string;
  price: number;
  issueDate: Date;
  companyName: string;
  isPaid: boolean;
  instructions?: string;
  ticketType?: string;
  paymentMethod?: string;
};

export type CarRequest = {
  id: string;
  ticketId: string;
  status: 'pending' | 'accepted' | 'completed';
  requestTime: Date;
};

type ValetState = {
  tickets: Ticket[];
  carRequests: CarRequest[];
};

type ValetAction = 
  | { type: 'SET_TICKETS'; payload: Ticket[] }
  | { type: 'SET_CAR_REQUESTS'; payload: CarRequest[] }
  | { type: 'ADD_TICKET'; payload: Ticket }
  | { type: 'REQUEST_CAR'; payload: CarRequest }
  | { type: 'UPDATE_REQUEST_STATUS'; payload: { id: string; status: 'pending' | 'accepted' | 'completed' } }
  | { type: 'UPDATE_PAYMENT_STATUS'; payload: { ticketId: string; isPaid: boolean } }
  | { type: 'DELETE_TICKET'; payload: { ticketId: string } };

const initialState: ValetState = {
  tickets: [],
  carRequests: [],
};

function valetReducer(state: ValetState, action: ValetAction): ValetState {
  switch (action.type) {
    case 'SET_TICKETS':
      return {
        ...state,
        tickets: action.payload,
      };
    case 'SET_CAR_REQUESTS':
      return {
        ...state,
        carRequests: action.payload,
      };
    case 'ADD_TICKET':
      return {
        ...state,
        tickets: [...state.tickets, action.payload],
      };
    case 'REQUEST_CAR':
      return {
        ...state,
        carRequests: [...state.carRequests, action.payload],
      };
    case 'UPDATE_REQUEST_STATUS':
      return {
        ...state,
        carRequests: state.carRequests.map(request => 
          request.id === action.payload.id 
            ? { ...request, status: action.payload.status } 
            : request
        ),
      };
    case 'UPDATE_PAYMENT_STATUS':
      return {
        ...state,
        tickets: state.tickets.map(ticket => 
          ticket.id === action.payload.ticketId 
            ? { ...ticket, isPaid: action.payload.isPaid } 
            : ticket
        ),
      };
    case 'DELETE_TICKET':
      return {
        ...state,
        tickets: state.tickets.filter(ticket => ticket.id !== action.payload.ticketId),
        carRequests: state.carRequests.filter(request => request.ticketId !== action.payload.ticketId),
      };
    default:
      return state;
  }
}

type ValetContextType = {
  state: ValetState;
  generateTicket: (price: number, ticketType: string, instructions?: string) => Promise<Ticket>;
  requestCar: (ticketNumber: string) => void;
  updateRequestStatus: (requestId: string, status: 'pending' | 'accepted' | 'completed') => void;
  updatePaymentStatus: (ticketId: string, isPaid: boolean, paymentMethod?: string) => void;
  deleteTicket: (ticketId: string) => void;
  getTicketByNumber: (ticketNumber: string) => Ticket | undefined;
  getRequestByTicketId: (ticketId: string) => CarRequest | undefined;
  getPendingRequests: () => CarRequest[];
};

const ValetContext = createContext<ValetContextType | undefined>(undefined);

export const ValetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(valetReducer, initialState);
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  // Initial data load
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Fetch tickets
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('tickets')
        .select('*');
      
      if (ticketsError) {
        console.error('Error fetching tickets:', ticketsError);
      } else if (ticketsData) {
        // Convert data to our format
        const formattedTickets: Ticket[] = ticketsData.map(ticket => ({
          id: ticket.id,
          ticketNumber: ticket.ticket_number,
          price: Number(ticket.price),
          issueDate: new Date(ticket.issue_date),
          companyName: ticket.company_name,
          isPaid: ticket.is_paid,
          instructions: ticket.instructions,
          ticketType: ticket.ticket_type,
          paymentMethod: ticket.payment_method,
        }));
        dispatch({ type: 'SET_TICKETS', payload: formattedTickets });
      }
      
      // Fetch car requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('car_requests')
        .select('*');
      
      if (requestsError) {
        console.error('Error fetching car requests:', requestsError);
      } else if (requestsData) {
        // Convert data to our format
        const formattedRequests: CarRequest[] = requestsData.map(request => ({
          id: request.id,
          ticketId: request.ticket_id,
          status: request.status as 'pending' | 'accepted' | 'completed',
          requestTime: new Date(request.request_time),
        }));
        dispatch({ type: 'SET_CAR_REQUESTS', payload: formattedRequests });
      }
      
      setLoading(false);
    };
    
    fetchData();
  }, []);

  // Set up realtime subscriptions
  useEffect(() => {
    // Subscribe to changes in car_requests table
    const carRequestsChannel = supabase
      .channel('car_requests_changes')
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'car_requests'
        }, 
        async (payload) => {
          console.log('Car request change received:', payload);
          
          // Reload all car requests to keep things simple
          const { data, error } = await supabase
            .from('car_requests')
            .select('*');
          
          if (error) {
            console.error('Error refreshing car requests:', error);
            return;
          }
          
          if (data) {
            const formattedRequests: CarRequest[] = data.map(request => ({
              id: request.id,
              ticketId: request.ticket_id,
              status: request.status as 'pending' | 'accepted' | 'completed',
              requestTime: new Date(request.request_time),
            }));
            
            dispatch({ type: 'SET_CAR_REQUESTS', payload: formattedRequests });
            
            // Show notification for status changes
            if (payload.eventType === 'UPDATE') {
              const newData = payload.new;
              const ticketInfo = state.tickets.find(t => t.id === newData.ticket_id);
              
              if (newData.status === 'accepted') {
                toast({
                  title: "تم قبول طلب السيارة",
                  description: ticketInfo 
                    ? `سيارتك برقم تذكرة #${ticketInfo.ticketNumber} يتم استرجاعها.`
                    : "تم قبول طلب سيارتك ويتم استرجاعها.",
                });
              } else if (newData.status === 'completed') {
                toast({
                  title: "السيارة جاهزة",
                  description: ticketInfo 
                    ? `سيارتك برقم تذكرة #${ticketInfo.ticketNumber} جاهزة للاستلام.`
                    : "سيارتك جاهزة للاستلام.",
                });
              }
            }
          }
        }
      )
      .subscribe();

    // Subscribe to changes in tickets table (especially deletions)
    const ticketsChannel = supabase
      .channel('tickets_changes')
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'tickets'
        }, 
        async (payload) => {
          console.log('Ticket change received:', payload);
          
          // Reload all tickets to keep things simple
          const { data, error } = await supabase
            .from('tickets')
            .select('*');
          
          if (error) {
            console.error('Error refreshing tickets:', error);
            return;
          }
          
          if (data) {
            const formattedTickets: Ticket[] = data.map(ticket => ({
              id: ticket.id,
              ticketNumber: ticket.ticket_number,
              price: Number(ticket.price),
              issueDate: new Date(ticket.issue_date),
              companyName: ticket.company_name,
              isPaid: ticket.is_paid,
              instructions: ticket.instructions,
              ticketType: ticket.ticket_type,
              paymentMethod: ticket.payment_method,
            }));
            
            dispatch({ type: 'SET_TICKETS', payload: formattedTickets });
          }
        }
      )
      .subscribe();

    // Clean up subscriptions
    return () => {
      supabase.removeChannel(carRequestsChannel);
      supabase.removeChannel(ticketsChannel);
    };
  }, [state.tickets]);

  const generateTicket = async (price: number, ticketType: string, instructions?: string): Promise<Ticket> => {
    // Get the highest existing ticket number
    let highestNumber = 0;
    
    // Find highest ticket number from existing tickets
    state.tickets.forEach(ticket => {
      const ticketNum = parseInt(ticket.ticketNumber, 10);
      if (!isNaN(ticketNum) && ticketNum > highestNumber) {
        highestNumber = ticketNum;
      }
    });
    
    // Increment the highest number by 1
    const nextNumber = highestNumber + 1;
    
    // Format as 5-digit number with leading zeros (00000, 00001, etc.)
    const ticketNumber = nextNumber.toString().padStart(5, '0');
    
    // Use constant price based on ticket type, ignore the passed-in price
    const constantPrice = getTicketPrice(ticketType);
    
    // Insert into Supabase
    const { data, error } = await supabase
      .from('tickets')
      .insert({
        ticket_number: ticketNumber,
        price: constantPrice,
        company_name: "Valet Parking Pro",
        is_paid: false,
        instructions,
        ticket_type: ticketType
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating ticket:', error);
      toast({
        title: "Error",
        description: "Failed to create ticket. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
    
    // Convert to our format
    const newTicket: Ticket = {
      id: data.id,
      ticketNumber: data.ticket_number,
      price: Number(data.price),
      issueDate: new Date(data.issue_date),
      companyName: data.company_name,
      isPaid: data.is_paid,
      instructions: data.instructions,
      ticketType: data.ticket_type,
      paymentMethod: data.payment_method,
    };
    
    dispatch({ type: 'ADD_TICKET', payload: newTicket });
    return newTicket;
  };

  const requestCar = async (ticketNumber: string) => {
    const ticket = state.tickets.find(t => t.ticketNumber === ticketNumber);
    
    if (!ticket) {
      toast({
        title: "خطأ",
        description: `رقم التذكرة ${ticketNumber} غير موجود.`,
        variant: "destructive",
      });
      return;
    }

    // Simplify the check - find ANY requests for this ticket ID regardless of status
    const existingRequest = state.carRequests.find(req => req.ticketId === ticket.id);

    if (existingRequest) {
      let message = "";
      
      // Customize message based on status
      if (existingRequest.status === 'pending') {
        message = "هذه السيارة تم طلبها بالفعل وفي انتظار المضيف.";
      } else if (existingRequest.status === 'accepted') {
        message = "هذه السيارة يتم استرجاعها حاليًا.";
      } else if (existingRequest.status === 'completed') {
        message = "هذه السيارة تم استرجاعها بالفعل ولا يمكن طلبها مرة أخرى.";
      }
      
      toast({
        title: "لا يمكن طلب هذه السيارة",
        description: message,
        variant: "destructive",
      });
      return;
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('car_requests')
      .insert({
        ticket_id: ticket.id,
        status: 'pending' as 'pending' | 'accepted' | 'completed'
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating car request:', error);
      toast({
        title: "خطأ",
        description: "فشل في إنشاء طلب السيارة. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
      return;
    }
    
    // Convert to our format
    const newRequest: CarRequest = {
      id: data.id,
      ticketId: data.ticket_id,
      status: data.status as 'pending' | 'accepted' | 'completed',
      requestTime: new Date(data.request_time)
    };

    dispatch({ type: 'REQUEST_CAR', payload: newRequest });
    
    toast({
      title: "تم طلب السيارة",
      description: `تم إرسال طلبك للسيارة رقم ${ticketNumber} إلى المضيف.`,
      variant: "default",
    });
  };

  const updateRequestStatus = async (requestId: string, status: 'pending' | 'accepted' | 'completed') => {
    // Update in Supabase
    const { error } = await supabase
      .from('car_requests')
      .update({ status })
      .eq('id', requestId);
      
    if (error) {
      console.error('Error updating request status:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة الطلب. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
      return;
    }
    
    dispatch({ type: 'UPDATE_REQUEST_STATUS', payload: { id: requestId, status } });
    
    // Show appropriate toast message
    if (status === 'accepted') {
      toast({
        title: "تم قبول الطلب",
        description: "يقوم المضيف باسترجاع سيارتك.",
      });
    } else if (status === 'completed') {
      toast({
        title: "تم إكمال الطلب",
        description: "تم تسليم السيارة.",
      });
      
      // Auto-deletion removed - will be handled manually
    }
  };

  const updatePaymentStatus = async (ticketId: string, isPaid: boolean, paymentMethod?: string) => {
    // Update in Supabase
    const { error } = await supabase
      .from('tickets')
      .update({ 
        is_paid: isPaid,
        payment_method: paymentMethod 
      })
      .eq('id', ticketId);
      
    if (error) {
      console.error('Error updating payment status:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة الدفع. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
      return;
    }
    
    dispatch({ type: 'UPDATE_PAYMENT_STATUS', payload: { ticketId, isPaid } });
    
    toast({
      title: isPaid ? "تم اكتمال الدفع" : "تم تحديث الدفع",
      description: isPaid ? "تم تحديد التذكرة كمدفوعة." : "تم تحديث حالة الدفع.",
    });

    // Auto-deletion removed - will be handled manually
  };

  const deleteTicket = async (ticketId: string) => {
    console.log(`Attempting deletion of ticket with ID: ${ticketId}`);
    
    try {
      // First, delete all car requests for this ticket
      const { error: requestsError } = await supabase
        .from('car_requests')
        .delete()
        .eq('ticket_id', ticketId);
        
      if (requestsError) {
        console.error('Failed to delete car requests:', requestsError);
        toast({
          title: "خطأ",
          description: "فشل في حذف الطلبات المرتبطة بالتذكرة.",
          variant: "destructive",
        });
        return;
      }
      
      // Then delete the ticket itself
      const { error: ticketError } = await supabase
        .from('tickets')
        .delete()
        .eq('id', ticketId);
        
      if (ticketError) {
        console.error('Failed to delete ticket:', ticketError);
        toast({
          title: "خطأ",
          description: "فشل في حذف التذكرة.",
          variant: "destructive",
        });
        return;
      }
      
      // Update local state
      dispatch({ type: 'DELETE_TICKET', payload: { ticketId } });
      
      toast({
        title: "تم حذف التذكرة",
        description: "تم حذف التذكرة والطلبات المرتبطة بها.",
      });
    } catch (error) {
      console.error('Error during deletion:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء محاولة حذف التذكرة.",
        variant: "destructive",
      });
    }
  };

  const getTicketByNumber = (ticketNumber: string) => {
    return state.tickets.find(t => t.ticketNumber === ticketNumber);
  };

  const getRequestByTicketId = (ticketId: string) => {
    return state.carRequests.find(r => r.ticketId === ticketId && r.status !== 'completed');
  };

  const getPendingRequests = () => {
    return state.carRequests.filter(r => r.status === 'pending');
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen" dir="rtl">جاري تحميل بيانات المضيف...</div>;
  }

  return (
    <ValetContext.Provider value={{
      state,
      generateTicket,
      requestCar,
      updateRequestStatus,
      updatePaymentStatus,
      deleteTicket,
      getTicketByNumber,
      getRequestByTicketId,
      getPendingRequests
    }}>
      {children}
    </ValetContext.Provider>
  );
};

export const useValet = (): ValetContextType => {
  const context = useContext(ValetContext);
  if (!context) {
    throw new Error('useValet must be used within a ValetProvider');
  }
  return context;
};
