import React, { memo } from 'react';
import type { Ticket } from "@/context/ValetContext";
import { formatDate } from "@/lib/date-utils";

interface TicketCardProps {
  ticket: Ticket;
  onSelect?: (ticketNumber: string) => void;
}

export const TicketCard: React.FC<TicketCardProps> = memo(({ ticket, onSelect }) => {
  return (
    <div className="p-4 mb-4 bg-gradient-to-r from-amber-600/25 to-amber-300/10 rounded-lg">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-medium">تذكرة رقم #{ticket.ticketNumber}</p>
          <p className="text-sm text-gray-500">
            {formatDate(ticket.issueDate, 'en-US')}
          </p>
          {ticket.ticketType && (
            <p className="text-xs text-gray-600 mt-1">النوع: {ticket.ticketType}</p>
          )}
        </div>
        
        <div className="text-left flex flex-col items-start">
          <p className="font-medium">${ticket.price.toFixed(2)}</p>
          <div className="flex items-center space-x-reverse space-x-2 mt-1">
            <span className={`text-sm ml-2 ${ticket.isPaid ? 'text-green-600' : 'text-red-600'}`}>
              {ticket.isPaid ? "مدفوع" : "غير مدفوع"}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between mt-3 pt-2 border-t">
        {ticket.instructions ? (
          <p className="text-sm text-gray-600 flex-1 pl-4">
            {ticket.instructions}
          </p>
        ) : (
          <span className="text-sm text-gray-400 italic">لا توجد تعليمات</span>
        )}
      </div>
    </div>
  );
});

