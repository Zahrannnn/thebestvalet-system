import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CarFront } from "lucide-react";
import { useValet } from "@/context/ValetContext";
import { toast } from "@/components/ui/use-toast";
import { TicketNumberDisplay } from "@/components/shared/TicketNumberDisplay";
import { Dialpad } from "@/components/shared/Dialpad";
import { useTicketNumberInput } from "@/hooks/useTicketNumberInput";

const RequestCar: React.FC = () => {
  const { requestCar, getTicketByNumber } = useValet();

  const handleRequestCar = (value: string) => {
    if (!value.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال رقم التذكرة.",
        variant: "destructive",
      });
      return;
    }

    const ticket = getTicketByNumber(value.trim());
    if (!ticket) {
      toast({
        title: "خطأ",
        description: "رقم تذكرة غير صالح. يرجى التحقق والمحاولة مرة أخرى.",
        variant: "destructive", 
      });
      return;
    }

    requestCar(value.trim());
  };
  
  const {
    ticketNumber,
    handleKeyPress,
    handleBackspace,
    handleClear,
    handleKeyDown,
    handlePaste,
    reset,
  } = useTicketNumberInput({
    maxLength: 5,
    onEnter: handleRequestCar,
  });

  const handleSubmit = () => {
    handleRequestCar(ticketNumber);
    reset();
  };

  return (
    <Card dir="rtl" tabIndex={0} onKeyDown={handleKeyDown} onPaste={handlePaste} autoFocus className="outline-none focus:ring-2 focus:ring-blue-400">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CarFront className="ml-2" /> طلب سيارة
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TicketNumberDisplay value={ticketNumber} />
        <Dialpad
          onKeyPress={handleKeyPress}
          onBackspace={handleBackspace}
          onClear={handleClear}
        />
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSubmit}
          disabled={!ticketNumber.trim()}
          className="w-full"
        >
          طلب السيارة
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RequestCar;
