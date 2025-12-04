import type { Ticket } from "@/context/ValetContext";
import { formatDate, formatTime } from "@/lib/date-utils";

/**
 * Print a ticket receipt using browser print functionality (window.open version)
 */
export function printTicket(ticket: Ticket): void {
  if (!ticket) return;

  const formattedDate = formatDate(ticket.issueDate, 'en-GB');
  const formattedTime = formatTime(ticket.issueDate, 'ar-SA');

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
}

/**
 * Print ticket receipt using iframe (for TicketDetails component)
 */
export function printTicketIframe(ticket: Ticket): void {
  if (!ticket) return;

  const printFrame = document.createElement('iframe');
  printFrame.style.position = 'fixed';
  printFrame.style.right = '0';
  printFrame.style.bottom = '0';
  printFrame.style.width = '0';
  printFrame.style.height = '0';
  printFrame.style.border = '0';
  
  document.body.appendChild(printFrame);
  
  const formattedDate = formatDate(ticket.issueDate, 'en-US');
  const formattedTime = formatTime(ticket.issueDate, 'en-US');
  
  const frameDoc = printFrame.contentWindow?.document;
  if (frameDoc) {
    frameDoc.open();
    frameDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt ${ticket.ticketNumber}</title>
          <style>
          img{
            width: 100%;
          }
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              width: 80mm;
              margin: 0;
              padding: 0;
            }
            .receipt {
              padding: 8mm 5mm;
              text-align: center;
            }
            .header {
              margin-bottom: 5mm;
            }
            .date-time {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8mm;
            }
            .company-name {
              font-size: 16px;
              font-weight: bold;
              margin: 5mm 0;
            }
            .instructions {
              font-size: 11px;
              margin: 5mm 0;
              text-align: center;
            }
            .price {
              font-size: 14px;
              font-weight: bold;
              margin: 5mm 0;
            }
            .info-text {
              font-size: 11px;
              margin: 3mm 0;
            }
            .ticket-number {
              font-size: 22px;
              font-weight: bold;
              margin: 8mm 0 5mm 0;
            }
            .qr-code {
              margin: auto;
              width: 25mm;
              height: 25mm;
            }
            .qr-code img {
              width: 100%;
              height: 100%;
            }
            .qr-placeholder {
              border: 1px solid #000;
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .arabic {
              font-size: 10px;
              color: #555;
              margin: 3mm 0;
            }
            .logo {
              opacity: 0.6;
              max-width: 100%;
              height: 10mm;
            }
            @media print {
              body { width: 80mm; }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="logo">
              <img src="./lloogo.png" alt="Logo" />
            </div>
            
            <div class="date-time">
            </div>
            
            <div class="company-name">The Best Valet</div>
            
            <div class="instructions">
              To recall your car, Please submit the card<br>
              to the cashier
            </div>
            
            <div class="price">
              Price: ${ticket.price.toFixed(2)}
            </div>
            
            <div class="info-text">
              Your car will be ready within 10 minutes
            </div>
            
            <div class="ticket-number">
              Ticket No&nbsp;&nbsp;&nbsp;${ticket.ticketNumber.padStart(5, '0')}
            </div>
             <div>Date: ${formattedDate}</div>
              <div>Time: ${formattedTime}</div>
            <div class="arabic">
              خدمة صف السيارات ذا بيست فالي
            </div>
            
            <div class="arabic">
              لاستدعاء سيارتك يرجى اعطاء الكارت للكاشير
            </div>
            
            <div class="arabic">
              سيارتك ستكون جاهزة خلال 10 دقائق
            </div>
            
            <div class="qr-code">
              <div class="qr-placeholder"><img src="./qr_code.png" alt="QR Code" /></div>
            </div>
          </div>
        </body>
      </html>
    `);
    frameDoc.close();
    
    printFrame.onload = () => {
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();
      
      setTimeout(() => {
        document.body.removeChild(printFrame);
      }, 1000);
    };
  }
}
