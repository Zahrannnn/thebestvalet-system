import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Printer, Ticket } from "lucide-react";
import { useValet, Ticket as TicketType } from "@/context/ValetContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TICKET_PRICES, getTicketPrice } from "@/constants/ticketPrices";
import { printTicket } from "@/services/print-service";

const TicketGenerator: React.FC = () => {
  const [instructions, setInstructions] = useState<string>("");
  // Ticket type is always STANDARD
  const ticketType = "PREMIUM";
  const [generatedTicket, setGeneratedTicket] = useState<TicketType | null>(null);
  const { generateTicket } = useValet();
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [qrCodePreview, setQrCodePreview] = useState<string>("");

  // Set current price for STANDARD
  useEffect(() => {
    setCurrentPrice(getTicketPrice(ticketType));
  }, []);

  // Generate and print ticket immediately
  const handleGenerateTicket = async () => {
    try {
      setIsGenerating(true);
      const newTicket = await generateTicket(0, ticketType, instructions);
      setGeneratedTicket(newTicket);
      setQrCodePreview("./qrcode.png");
      setInstructions("");
      setCurrentPrice(getTicketPrice(ticketType));
      // Print first copy
      setTimeout(() => {
        printTicket(newTicket);
        // Print second copy after 3 seconds
        setTimeout(() => {
          printTicket(newTicket);
        }, 3000);
      }, 100);
    } catch (error) {
      console.error("Error generating ticket:", error);
    } finally {
      setIsGenerating(false);
    }
  };


  return (
    <div className="space-y-6" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-5" dir="rtl">
            <Ticket className="mr-2" /> تذكرة جديدة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="instructions">تعليمات خاصة (اختياري)</Label>
              <Textarea
                id="instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="أي تعليمات خاصة للمضيف..."
                rows={3}
              />
            </div>
            <div className="text-center p-2 bg-amber-100 rounded-md">
              <span className="text-amber-800 font-semibold">
                السعر المحدد: {currentPrice?.toFixed(2)} د.ك
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleGenerateTicket}
            disabled={isGenerating}
            className="w-full bg-blue-500 hover:bg-blue-600"
          >
            {isGenerating ? "جاري التوليد..." : "انشاء"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TicketGenerator;