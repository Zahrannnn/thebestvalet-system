import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CarFront } from "lucide-react";
import { useValet } from "@/context/ValetContext";
import { toast } from "@/components/ui/use-toast";

const RequestCar: React.FC = () => {
  const [ticketNumber, setTicketNumber] = useState<string>("");
  const { requestCar, getTicketByNumber } = useValet();

  const handleRequestCar = () => {
    if (!ticketNumber.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال رقم التذكرة.",
        variant: "destructive",
      });
      return;
    }

    const ticket = getTicketByNumber(ticketNumber.trim());
    if (!ticket) {
      toast({
        title: "خطأ",
        description: "رقم تذكرة غير صالح. يرجى التحقق والمحاولة مرة أخرى.",
        variant: "destructive", 
      });
      return;
    }

    requestCar(ticketNumber.trim());
    setTicketNumber("");
  };

  // Keyboard handler for typing ticket number
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key >= '0' && e.key <= '9') {
      setTicketNumber((prev) => prev.length < 5 ? prev + e.key : prev);
    } else if (e.key === 'Backspace') {
      setTicketNumber((prev) => prev.slice(0, -1));
    } else if (e.key === 'Escape') {
      setTicketNumber("");
    } else if (e.key === 'Enter') {
      handleRequestCar();
    }
  };

  // Paste handler for the Card
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const pasted = e.clipboardData.getData('Text').replace(/\D/g, '').slice(0, 5);
    setTicketNumber(pasted);
    e.preventDefault();
  };

  return (
    <Card dir="rtl" tabIndex={0} onKeyDown={handleKeyDown} onPaste={handlePaste} autoFocus className="outline-none focus:ring-2 focus:ring-blue-400">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CarFront className="ml-2" /> طلب سيارة
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-center items-center my-2">
            <span className="text-3xl font-mono tracking-widest bg-gray-100 rounded px-4 py-2 min-w-[120px] text-center select-all">
              {ticketNumber || <span className="text-gray-400">00000</span>}
            </span>
          </div>
          {/* Dialpad */}
          <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto mt-4">
            {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((key, idx) => (
              <Button
                key={idx}
                variant="outline"
                className="text-lg py-6 transition-transform active:scale-95 focus:scale-95"
                aria-label={key === '⌫' ? 'حذف رقم' : key === '' ? undefined : `رقم ${key}`}
                onClick={() => {
                  if (key === "⌫") {
                    setTicketNumber((prev) => prev.slice(0, -1));
                  } else if (key === "") {
                    // Empty cell for layout
                  } else {
                    setTicketNumber((prev) => prev.length < 5 ? prev + key : prev);
                  }
                }}
                disabled={key === ""}
                tabIndex={-1}
              >
                {key}
              </Button>
            ))}
            {/* Clear button below the dialpad */}
            <Button
              variant="destructive"
              className="col-span-3 mt-2"
              onClick={() => setTicketNumber("")}
              tabIndex={-1}
              disabled={!ticketNumber}
            >
              مسح الكل
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleRequestCar}
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
