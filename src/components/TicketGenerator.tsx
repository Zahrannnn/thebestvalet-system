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
        browserPrint(newTicket);
        // Print second copy after 3 seconds
        setTimeout(() => {
          browserPrint(newTicket);
        }, 3000);
      }, 100);
    } catch (error) {
      console.error("Error generating ticket:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Print function now takes a ticket argument
  const browserPrint = async (ticket) => {
    if (!ticket) return;
    const formattedDate = ticket.issueDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const formattedTime = ticket.issueDate.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    const printContent = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
        <head>
          <meta charset="UTF-8">
          <title>Receipt ${ticket.ticketNumber}</title>
          <style>
            @media print {
              @page {
                size: 80mm auto;
                margin: 0;
              }
              body { 
                width: 80mm; 
                margin: 0;
                padding: 0;
              }
            }
            body {
              font-family: 'Noto Sans Arabic', 'Arial Unicode MS', Arial, sans-serif;
              font-size: 12px;
              width: 80mm;
              margin: 0;
              padding: 0;
              direction: rtl;
              text-align: center;
              line-height: 1.1;
            }
            .receipt {
              padding: 0;
              width: 100%;
              margin: 0;
              word-wrap: break-word;
              overflow-wrap: break-word;
            }
            .logo {
              margin-bottom: 2mm;
              text-align: center;
            }
            .logo img {
              width: 25mm;
              height: auto;
              max-height: 12mm;
              object-fit: contain;
            }
            .company-name {
              font-size: 14px;
              font-weight: bold;
              margin: 1mm 0;
              text-align: center;
            }
            .date-time {
              font-size: 10px;
              margin: 1mm 0;
              text-align: center;
              border-bottom: 1px dashed #333;
              padding-bottom: 1mm;
            }
            .instructions {
              font-size: 10px;
              margin: 2mm 0;
              text-align: center;
              font-weight: bold;
              line-height: 1.1;
            }
            .price {
              font-size: 14px;
              font-weight: bold;
              margin: 2mm 0;
              text-align: center;
              border: 1px solid #000;
              padding: 1mm;
            }
            .ticket-number {
              font-size: 16px;
              font-weight: bold;
              margin: 2mm 0;
              text-align: center;
              color: black;
              padding: 1mm;
            }
            .qr-section {
              margin: 2mm 0;
              text-align: center;
            }
            .qr-label {
              font-size: 9px;
              margin-bottom: 1mm;
            }
            .qr-code {
              width: 20mm;
              height: 20mm;
              margin: 0 auto;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .qr-code img {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
            .footer-info {
              font-size: 8px;
              margin: 2mm 0;
              text-align: center;
              line-height: 1.1;
              border-top: 1px dashed #333;
              padding-top: 1mm;
            }
            .special-instructions {
              font-size: 8px;
              margin: 1mm 0;
              padding: 1mm;
              border: 1px solid #ccc;
              background: #f9f9f9;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="logo">
              <img src="./logo.jpg" alt="ذا بيست فاليه" onerror="this.outerHTML='<div class=&quot;company-name&quot;>ذا بيست فاليه</div>'" />
            </div>
            <div class="date-time">
              التاريخ: ${formattedDate} | الوقت: ${formattedTime}
            </div>
            <div class="instructions">
              لاستدعاء سيارتك يرجى إعطاء الكارت للكاشير<br>
              أو مسح الرمز أدناه
            </div>
            <div class="price">
              السعر: ${ticket.price.toFixed(2)} د.ك
            </div>
            <div class="ticket-number">
              التذكرة #${ticket.ticketNumber.padStart(5, '0')}
            </div>
            <div class="qr-section">
              <div class="qr-label">امسح الرمز:</div>
              <div class="qr-code">
                <img src="./qrcode.png" alt="QR Code" />
              </div>
            </div>
            ${ticket.instructions ? `
            <div class="special-instructions">
              تعليمات خاصة:<br>
              ${ticket.instructions}
            </div>
            ` : ''}
            <div class="footer-info">
              رقم التذكرة: ${ticket.ticketNumber}<br>
              سيارتك ستكون جاهزة خلال 10 دقائق<br>
              شكراً لاستخدام خدماتنا
            </div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                setTimeout(function() {
                  window.close();
                }, 1000);
              }, 500);
            };
          </script>
        </body>
      </html>
    `;
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
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