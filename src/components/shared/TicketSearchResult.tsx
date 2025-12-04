import React, { memo } from 'react';
import type { Ticket } from "@/context/ValetContext";
import { formatDate } from "@/lib/date-utils";

interface TicketSearchResultProps {
  ticket: Ticket;
}

export const TicketSearchResult: React.FC<TicketSearchResultProps> = memo(({ ticket }) => {
  return (
    <div className="p-3">
      <div className="flex justify-between">
        <div>
          <p className="font-medium text-amber-900">
            تذكرة رقم #{ticket.ticketNumber}
          </p>
          <p className="text-sm text-amber-700">
            {formatDate(ticket.issueDate, 'en-US')}
          </p>
        </div>
        <div className="text-left">
          <p className="font-medium text-amber-800">
            ${ticket.price.toFixed(2)}
          </p>
          <span
            className={`text-xs px-2 py-1 rounded ${
              ticket.isPaid
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {ticket.isPaid ? "مدفوع" : "غير مدفوع"}
          </span>
        </div>
      </div>
      {ticket.instructions && (
        <p className="mt-2 text-sm text-amber-800 bg-amber-50 p-2 rounded border border-amber-200">
          {ticket.instructions}
        </p>
      )}
    </div>
  );
});

