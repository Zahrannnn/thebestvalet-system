import React from 'react';
import { formatCurrency } from "@/lib/date-utils";
import { LucideIcon } from "lucide-react";

interface RevenueStatsCardProps {
  title: string;
  value: number;
  count: number;
  percentage?: number;
  icon: LucideIcon;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

export const RevenueStatsCard: React.FC<RevenueStatsCardProps> = ({
  title,
  value,
  count,
  percentage,
  icon: Icon,
  bgColor,
  textColor,
  borderColor,
}) => {
  return (
    <div className={`${bgColor} rounded-lg p-4 border ${borderColor}`}>
      <div className={`${textColor} font-medium mb-2 flex items-center gap-2`}>
        {title}
        <Icon className="h-4 w-4 ml-2" />
      </div>
      <div className="text-2xl font-bold">
        {formatCurrency(value)}
      </div>
      <div className="text-sm text-gray-500">
        {count} تذكرة
        {percentage !== undefined && (
          <span> ({percentage}٪)</span>
        )}
      </div>
    </div>
  );
};

