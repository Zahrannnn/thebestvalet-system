import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getTicketPrice } from "@/constants/ticketPrices";
import { fetchAllTickets, createTicket as createTicketService, updateTicketPayment, deleteTicket as deleteTicketService } from "@/services/ticket-service";
import { fetchAllCarRequests, createCarRequest, updateCarRequestStatus } from "@/services/car-request-service";

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

  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
   
        const tickets = await fetchAllTickets();
        dispatch({ type: 'SET_TICKETS', payload: tickets });
      } catch (error) {
        console.error('Error fetching tickets:', error);
      }
      
      try {

        const requests = await fetchAllCarRequests();
        dispatch({ type: 'SET_CAR_REQUESTS', payload: requests });
      } catch (error) {
        console.error('Error fetching car requests:', error);
      }
      
      setLoading(false);
    };
    
    fetchData();
  }, []);


  useEffect(() => {
   
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
          
          
          try {
            const requests = await fetchAllCarRequests();
            dispatch({ type: 'SET_CAR_REQUESTS', payload: requests });
            
            
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
          } catch (error) {
            console.error('Error refreshing car requests:', error);
          }
        }
      )
      .subscribe();

    
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
          
          
          try {
            const tickets = await fetchAllTickets();
            dispatch({ type: 'SET_TICKETS', payload: tickets });
          } catch (error) {
            console.error('Error refreshing tickets:', error);
          }
        }
      )
      .subscribe();

    // Clean up subscriptions
    return () => {
      supabase.removeChannel(carRequestsChannel);
      supabase.removeChannel(ticketsChannel);
    };
  }, [state.tickets, toast]);

  const generateTicket = async (price: number, ticketType: string, instructions?: string): Promise<Ticket> => {
    
    let highestNumber = 0;
    
    
    state.tickets.forEach(ticket => {
      const ticketNum = parseInt(ticket.ticketNumber, 10);
      if (!isNaN(ticketNum) && ticketNum > highestNumber) {
        highestNumber = ticketNum;
      }
    });
    
    
    const nextNumber = highestNumber + 1;
    
    
    const ticketNumber = nextNumber.toString().padStart(5, '0');
    
    
    const constantPrice = getTicketPrice(ticketType);
    
    try {
      const newTicket = await createTicketService({
        ticketNumber,
        price: constantPrice,
        ticketType,
        instructions,
        companyName: "Valet Parking Pro",
      });
      
      dispatch({ type: 'ADD_TICKET', payload: newTicket });
      return newTicket;
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast({
        title: "Error",
        description: "Failed to create ticket. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
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

    
    const existingRequest = state.carRequests.find(req => req.ticketId === ticket.id);

    if (existingRequest) {
      let message = "";
      
      
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

    try {
      const newRequest = await createCarRequest(ticket.id);
      dispatch({ type: 'REQUEST_CAR', payload: newRequest });
      toast({
        title: "تم طلب السيارة",
        description: `تم إرسال طلبك للسيارة رقم ${ticketNumber} إلى المضيف.`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error creating car request:', error);
      toast({
        title: "خطأ",
        description: "فشل في إنشاء طلب السيارة. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  };

  const updateRequestStatus = async (requestId: string, status: 'pending' | 'accepted' | 'completed') => {
    try {
      await updateCarRequestStatus(requestId, status);
      dispatch({ type: 'UPDATE_REQUEST_STATUS', payload: { id: requestId, status } });
  
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
        
        
      }
    } catch (error) {
      console.error('Error updating request status:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة الطلب. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  };

  const updatePaymentStatus = async (ticketId: string, isPaid: boolean, paymentMethod?: string) => {
    try {
      await updateTicketPayment(ticketId, isPaid, paymentMethod);
      dispatch({ type: 'UPDATE_PAYMENT_STATUS', payload: { ticketId, isPaid } });
      
      toast({
        title: isPaid ? "تم اكتمال الدفع" : "تم تحديث الدفع",
        description: isPaid ? "تم تحديد التذكرة كمدفوعة." : "تم تحديث حالة الدفع.",
      });

      
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة الدفع. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  };

  const deleteTicket = async (ticketId: string) => {
    console.log(`Attempting deletion of ticket with ID: ${ticketId}`);
    
    try {
      await deleteTicketService(ticketId);
      
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
