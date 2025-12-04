import React from 'react';
import type { Ticket } from "@/context/ValetContext";
import { formatDate } from "@/lib/date-utils";

interface TicketInfoDisplayProps {
  ticket: Ticket;
}

export const TicketInfoDisplay: React.FC<TicketInfoDisplayProps> = ({ ticket }) => {
  return (
    <div className="print-ticket border rounded-md p-4 mx-auto bg-white mb-4">
      <div className="text-center mb-4 border-b pb-2">
        <h2 className="text-xl font-bold">{ticket.companyName}</h2>
        <p className="text-sm text-gray-600">Valet Parking Ticket</p>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Ticket No:</span>
          <span className="font-bold">{ticket.ticketNumber}</span>
        </div>
        
        {ticket.ticketType && (
          <div className="flex justify-between">
            <span className="text-gray-600">Type:</span>
            <span className="font-bold">{ticket.ticketType}</span>
          </div>
        )}
        
        <div className="flex justify-between">
          <span className="text-gray-600">Date:</span>
          <span>{formatDate(ticket.issueDate, 'en-US')}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Fee:</span>
          <span className="font-bold">${ticket.price.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Payment Status:</span>
          <span className={ticket.isPaid ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
            {ticket.isPaid ? "PAID" : "UNPAID"}
          </span>
        </div>
      </div>
      
      {ticket.instructions && (
        <div className="mt-3 pt-2 border-t">
          <p className="text-sm text-gray-600">Instructions:</p>
          <p className="text-sm">{ticket.instructions}</p>
        </div>
      )}
      
      <div className="mt-4 pt-2 border-t text-center">
        <div className="border border-dashed mx-auto p-3 w-36 h-36 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xs text-gray-500">QR Code</p>
            <p className="text-xs text-gray-500">{ticket.ticketNumber}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-3 text-center text-xs text-gray-500">
        <p>Thank you for using our valet service</p>
        <p className="mt-1">Present this ticket when retrieving your vehicle</p>
      </div>
    </div>
  );
};

