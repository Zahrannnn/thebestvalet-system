import React, { memo } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CarRequest } from "@/context/ValetContext";
import { formatTime } from "@/lib/date-utils";

interface CarRequestItemProps {
  request: CarRequest;
  ticketNumber: string;
  isValetMode?: boolean;
  onAccept?: (requestId: string) => void;
  onComplete?: (request: CarRequest) => void;
  status: 'pending' | 'accepted';
}

export const CarRequestItem: React.FC<CarRequestItemProps> = memo(({
  request,
  ticketNumber,
  isValetMode = false,
  onAccept,
  onComplete,
  status,
}) => {
  return (
    <div className="py-3">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-medium">
            تذكرة رقم #{ticketNumber}
          </p>
          <p className="text-sm text-gray-500">
            {status === 'pending' 
              ? `تم الطلب في ${formatTime(request.requestTime)}`
              : `تم القبول في ${formatTime(request.requestTime)}`}
          </p>
        </div>
        {status === 'pending' ? (
          isValetMode && onAccept ? (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onAccept(request.id)}
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              قبول الطلب
            </Button>
          ) : (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              معلق
            </Badge>
          )
        ) : (
          onComplete && (
            <Button 
              size="sm" 
              onClick={() => onComplete(request)}
              className="bg-green-600 hover:bg-green-700"
            >
              إكمال وتحصيل
            </Button>
          )
        )}
      </div>
    </div>
  );
});

