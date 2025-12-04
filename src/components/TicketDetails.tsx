import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Printer, X } from "lucide-react";
import { useValet, Ticket, CarRequest } from "@/context/ValetContext";
import { TicketInfoDisplay } from "@/components/shared/TicketInfoDisplay";
import { printTicketIframe } from "@/services/print-service";
import { formatDateTime } from "@/lib/date-utils";

interface TicketDetailsProps {
  ticketNumber: string;
  onClose: () => void;
}

const TicketDetails: React.FC<TicketDetailsProps> = ({ ticketNumber, onClose }) => {
  const { getTicketByNumber, updatePaymentStatus, getRequestByTicketId } = useValet();
  const [ticket, setTicket] = useState<Ticket | undefined>();
  const [request, setRequest] = useState<CarRequest | undefined>();
  
  useEffect(() => {
    const currentTicket = getTicketByNumber(ticketNumber);
    setTicket(currentTicket);
    
    if (currentTicket) {
      const currentRequest = getRequestByTicketId(currentTicket.id);
      setRequest(currentRequest);
    }
  }, [ticketNumber, getTicketByNumber, getRequestByTicketId]);

  const handleTogglePayment = () => {
    if (ticket) {
      updatePaymentStatus(ticket.id, !ticket.isPaid);
      setTicket({
        ...ticket,
        isPaid: !ticket.isPaid
      });
    }
  };

  const handlePrint = () => {
    if (!ticket) return;
    printTicketIframe(ticket);
  };

  if (!ticket) {
    return null;
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="relative pb-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-2 top-2"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        <CardTitle>Ticket Details</CardTitle>
      </CardHeader>
      <CardContent>
        <TicketInfoDisplay ticket={ticket} />

        {/* Payment switch - only visible when not printing */}
        <div className="no-print space-y-4">
          <div className="flex items-center space-x-4 pb-4">
            <Switch 
              id="payment-status"
              checked={ticket.isPaid}
              onCheckedChange={handleTogglePayment}
            />
            <Label htmlFor="payment-status">Mark as Paid</Label>
          </div>

          {request && (
            <div className="p-3 bg-blue-50 rounded-md">
              <p className="text-sm font-medium text-blue-700">
                Car Request Status: {request.status === 'pending' ? 'Waiting for valet' : 'Being retrieved'}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Requested at: {formatDateTime(request.requestTime)}
              </p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="justify-between no-print">
        <Button variant="outline" onClick={onClose}>Close</Button>
        <Button variant="default" onClick={handlePrint} className="flex items-center">
          <Printer className="mr-2 h-4 w-4" /> Print Receipt
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TicketDetails;
