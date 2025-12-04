import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useValet, CarRequest } from "@/context/ValetContext";
import PaymentConfirmationDialog from './PaymentConfirmationDialog';
import { toast } from "@/components/ui/use-toast";
import { CarRequestList } from "@/components/shared/CarRequestList";
import { useTicketCache } from "@/hooks/useTicketCache";
import { useCarRequestRealtime } from "@/hooks/useCarRequestRealtime";
import { useNotificationSound } from "@/hooks/useNotificationSound";

const EntranceNotificationPanel: React.FC = () => {
  const { state, updateRequestStatus } = useValet();
  const pendingRequests = state.carRequests.filter(req => req.status === 'pending');
  const acceptedRequests = state.carRequests.filter(req => req.status === 'accepted');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CarRequest | null>(null);
  const [isValetMode, setIsValetMode] = useState<boolean>(false);
  const { playSound } = useNotificationSound();

  const allRequests = [...pendingRequests, ...acceptedRequests];
  const { getTicketNumber, getTicketPrice } = useTicketCache(allRequests);

  useCarRequestRealtime("notifications-car-requests");

  useEffect(() => {
    const valetModeStatus = sessionStorage.getItem('entranceValetMode');
    if (valetModeStatus === 'true') {
      setIsValetMode(true);
    }
  }, []);

  const handleAcceptRequest = (requestId: string) => {
    playSound();
    updateRequestStatus(requestId, 'accepted');
    
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
    return getTicketNumber(request.ticketId, (ticketId) => {
      const ticket = state.tickets.find(t => t.id === ticketId);
      return ticket?.ticketNumber;
    });
  };

  const getTicketPriceFromRequest = (request: CarRequest) => {
    return getTicketPrice(request.ticketId, (ticketId) => {
      const ticket = state.tickets.find(t => t.id === ticketId);
      return ticket?.price;
    });
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
              onClick={() => playSound()} 
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
          <CarRequestList
            pendingRequests={pendingRequests}
            acceptedRequests={acceptedRequests}
            getTicketNumber={getTicketNumberFromRequest}
            isValetMode={isValetMode}
            onAccept={handleAcceptRequest}
            onComplete={handleCompleteRequest}
          />
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