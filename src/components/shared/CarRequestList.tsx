import React from 'react';
import { CarFront, Clock, Check } from "lucide-react";
import type { CarRequest } from "@/context/ValetContext";
import { CarRequestItem } from "./CarRequestItem";

interface CarRequestListProps {
  pendingRequests: CarRequest[];
  acceptedRequests: CarRequest[];
  getTicketNumber: (request: CarRequest) => string;
  isValetMode?: boolean;
  onAccept?: (requestId: string) => void;
  onComplete?: (request: CarRequest) => void;
}

export const CarRequestList: React.FC<CarRequestListProps> = ({
  pendingRequests,
  acceptedRequests,
  getTicketNumber,
  isValetMode = false,
  onAccept,
  onComplete,
}) => {
  if (pendingRequests.length === 0 && acceptedRequests.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
          <CarFront className="h-6 w-6 text-gray-400" />
        </div>
        <p>لا توجد طلبات سيارات نشطة في الوقت الحالي.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {pendingRequests.length > 0 && (
        <div>
          <h3 className="font-medium mb-2 text-amber-600 flex items-center">
            <span className="bg-amber-100 text-amber-600 p-1 rounded ml-2">
              <Clock className="h-4 w-4" />
            </span>
            في انتظار المضيف
          </h3>
          <div className="divide-y">
            {pendingRequests.map((request) => (
              <CarRequestItem
                key={request.id}
                request={request}
                ticketNumber={getTicketNumber(request)}
                isValetMode={isValetMode}
                onAccept={onAccept}
                status="pending"
              />
            ))}
          </div>
        </div>
      )}
      
      {acceptedRequests.length > 0 && (
        <div>
          <h3 className="font-medium mb-2 text-green-600 flex items-center">
            <span className="bg-green-100 text-green-600 p-1 rounded ml-2">
              <Check className="h-4 w-4" />
            </span>
            سيارات يتم استرجاعها
          </h3>
          <div className="divide-y">
            {acceptedRequests.map((request) => (
              <CarRequestItem
                key={request.id}
                request={request}
                ticketNumber={getTicketNumber(request)}
                onComplete={onComplete}
                status="accepted"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

