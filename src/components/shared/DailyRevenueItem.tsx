import React, { memo } from 'react';
import { Calendar, Banknote, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/date-utils";
import type { DailyRevenue } from "@/services/revenue-service";

interface DailyRevenueItemProps {
  day: DailyRevenue;
}

export const DailyRevenueItem: React.FC<DailyRevenueItemProps> = memo(({ day }) => {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <div className="font-medium flex items-center">
          <Calendar className="h-4 w-4 ml-2 text-amber-600" />
          {day.date}
        </div>
        <div className="text-lg font-bold">
          {formatCurrency(day.totalRevenue)}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-2">
        <div className="text-sm flex items-center">
          <Banknote className="h-3 w-3 text-green-600 ml-1" />
          <span className="text-gray-600">نقدي: </span>
          <span className="font-medium mr-1">
            {formatCurrency(day.cashRevenue)}
          </span>
        </div>
        <div className="text-sm flex items-center">
          <CreditCard className="h-3 w-3 text-blue-600 ml-1" />
          <span className="text-gray-600">بطاقات: </span>
          <span className="font-medium mr-1">
            {formatCurrency(day.visaRevenue)}
          </span>
        </div>
      </div>
    </div>
  );
});

