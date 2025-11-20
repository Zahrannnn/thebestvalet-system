import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useValet, CarRequest } from "@/context/ValetContext";
import { Calendar, CarFront, Check, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PaymentConfirmationDialog from './PaymentConfirmationDialog';
import { toast } from "@/components/ui/use-toast";

interface TicketCache {
  [key: string]: string;
}

interface TicketPriceCache {
  [key: string]: number;
}

// Define interface for the RealTime payload
interface CarRequestPayload {
  new: {
    id: string;
    ticket_id: string;
    status: string;
    request_time: string;
  };
  old: {
    id: string;
    ticket_id: string;
    status: string;
    request_time: string;
  };
  eventType: "INSERT" | "UPDATE" | "DELETE";
}

const EntranceNotificationPanel: React.FC = () => {
  const { state, updateRequestStatus } = useValet();
  const pendingRequests = state.carRequests.filter(req => req.status === 'pending');
  const acceptedRequests = state.carRequests.filter(req => req.status === 'accepted');
  const [ticketCache, setTicketCache] = useState<TicketCache>({});
  const [priceCache, setPriceCache] = useState<TicketPriceCache>({});
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CarRequest | null>(null);
  const [isValetMode, setIsValetMode] = useState<boolean>(false);

  // Play notification sound
  const playNotificationSound = () => {
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3");
    audio.volume = 0.5;
    audio.play().catch((e) => console.error("Audio play failed:", e));
  };

  // Subscribe to real-time updates for car requests
  useEffect(() => {
    const carRequestsChannel = supabase
      .channel("notifications-car-requests")
      // @ts-expect-error - Supabase types don't match implementation for RealtimeChannel
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "car_requests",
        },
        async (payload: CarRequestPayload) => {
          console.log("Car request change received in Notification Panel:", payload);

          // Handle new car requests
          if (payload.eventType === "INSERT") {
            const newData = payload.new;
            if (newData.status === "pending") {
              // Play notification sound for new requests
              playNotificationSound();
              
              // Show toast notification for new request
              toast({
                title: "طلب استرجاع سيارة جديد",
                description: "هناك طلب جديد لاسترجاع سيارة في الانتظار",
                variant: "default",
              });
            }
          }
        }
      )
      .subscribe();

    // Clean up subscription
    return () => {
      supabase.removeChannel(carRequestsChannel);
    };
  }, []);

  // Fetch ticket numbers for all requests on mount and when requests change
  useEffect(() => {
    const fetchTicketNumbers = async () => {
      const allRequests = [...pendingRequests, ...acceptedRequests];
      const ticketIdsToFetch = allRequests
        .filter(req => !ticketCache[req.ticketId] || !priceCache[req.ticketId])
        .map(req => req.ticketId);
      
      if (ticketIdsToFetch.length === 0) return;
      
      const { data, error } = await supabase
        .from('tickets')
        .select('id, ticket_number, price')
        .in('id', ticketIdsToFetch);
      
      if (error) {
        console.error('Error fetching ticket numbers:', error);
        return;
      }
      
      if (data && data.length > 0) {
        const newCache = { ...ticketCache };
        const newPriceCache = { ...priceCache };
        data.forEach(ticket => {
          newCache[ticket.id] = ticket.ticket_number;
          newPriceCache[ticket.id] = Number(ticket.price);
        });
        setTicketCache(newCache);
        setPriceCache(newPriceCache);
      }
    };
    
    fetchTicketNumbers();
  }, [pendingRequests, acceptedRequests, ticketCache, priceCache]);

  // Check if user has valet mode enabled in this session
  useEffect(() => {
    const valetModeStatus = sessionStorage.getItem('entranceValetMode');
    if (valetModeStatus === 'true') {
      setIsValetMode(true);
    }
  }, []);

  const handleAcceptRequest = (requestId: string) => {
    // Play notification sound when accepting request
    playNotificationSound();

    updateRequestStatus(requestId, 'accepted');
    
    // Show toast notification
    toast({
      title: "تم قبول الطلب",
      description: "سيتم إحضار السيارة في أقرب وقت",
      variant: "default",
    });
  };

  const handleCompleteRequest = (request: CarRequest) => {
    setSelectedRequest(request);
    setPaymentDialogOpen(true);
  };

  const closePaymentDialog = () => {
    setPaymentDialogOpen(false);
    setSelectedRequest(null);
  };

  const getTicketNumberFromRequest = (request: CarRequest) => {
    // First check our cache
    if (ticketCache[request.ticketId]) {
      return ticketCache[request.ticketId];
    }
    
    // Fallback to state (this might return Unknown)
    const ticket = state.tickets.find(t => t.id === request.ticketId);
    return ticket ? ticket.ticketNumber : 'Unknown';
  };

  const getTicketPriceFromRequest = (request: CarRequest) => {
    // First check our cache
    if (priceCache[request.ticketId]) {
      return priceCache[request.ticketId];
    }
    
    // Fallback to state
    const ticket = state.tickets.find(t => t.id === request.ticketId);
    return ticket ? ticket.price : 0;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <Card dir="rtl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>إشعارات طلبات السيارات</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={playNotificationSound} 
              className="text-xs text-gray-500 hover:text-amber-600"
              title="اختبار الصوت"
            >
              اختبار الصوت
            </Button>
          </div>
          <CardDescription>
            عرض حالة طلبات استرجاع السيارات الحالية
            {isValetMode && <span className="mr-2 font-semibold text-green-600">(وضع المضيف مفعل)</span>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 && acceptedRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <CarFront className="h-6 w-6 text-gray-400" />
              </div>
              <p>لا توجد طلبات سيارات نشطة في الوقت الحالي.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingRequests.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2 text-amber-600 flex items-center">
                    <span className="bg-amber-100 text-amber-600 p-1 rounded ml-2">
                      <Clock className="h-4 w-4" />
                    </span>
                    في انتظار المضيف
                  </h3>
                  <div className="divide-y">
                    {pendingRequests.map((request) => (
                      <div key={request.id} className="py-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">
                              تذكرة رقم #{getTicketNumberFromRequest(request)}
                            </p>
                            <p className="text-sm text-gray-500">
                              تم الطلب في {formatTime(request.requestTime)}
                            </p>
                          </div>
                          {isValetMode ? (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleAcceptRequest(request.id)}
                              className="text-blue-600 border-blue-600 hover:bg-blue-50"
                            >
                              قبول الطلب
                            </Button>
                          ) : (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                              معلق
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {acceptedRequests.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2 text-green-600 flex items-center">
                    <span className="bg-green-100 text-green-600 p-1 rounded ml-2">
                      <Check className="h-4 w-4" />
                    </span>
                    سيارات يتم استرجاعها
                  </h3>
                  <div className="divide-y">
                    {acceptedRequests.map((request) => (
                      <div key={request.id} className="py-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">
                              تذكرة رقم #{getTicketNumberFromRequest(request)}
                            </p>
                            <p className="text-sm text-gray-500">
                              تم القبول في {formatTime(request.requestTime)}
                            </p>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => handleCompleteRequest(request)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            إكمال وتحصيل
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedRequest && (
        <PaymentConfirmationDialog
          isOpen={paymentDialogOpen}
          onClose={closePaymentDialog}
          requestId={selectedRequest.id}
          ticketId={selectedRequest.ticketId}
          ticketNumber={getTicketNumberFromRequest(selectedRequest)}
          price={getTicketPriceFromRequest(selectedRequest)}
        />
      )}
    </>
  );
};

export default EntranceNotificationPanel; 