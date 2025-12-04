import React, { memo } from 'react';
import { AlertCircle, Clock, Car } from "lucide-react";
import { cn } from "@/lib/utils";

type StatusType = 'success' | 'error' | 'exists';

interface StatusMessageProps {
  status: StatusType;
  message: string;
  show: boolean;
}

const statusConfig: Record<StatusType, { 
  icon: React.ComponentType<{ className?: string }>;
  colors: string;
  bgColor: string;
  title: string;
}> = {
  success: {
    icon: Car,
    colors: 'bg-green-50 border-green-100 text-green-700',
    bgColor: 'bg-green-100',
    title: 'Success!',
  },
  exists: {
    icon: Clock,
    colors: 'bg-blue-50 border-blue-100 text-blue-700',
    bgColor: 'bg-blue-100',
    title: 'Already Requested',
  },
  error: {
    icon: AlertCircle,
    colors: 'bg-red-50 border-red-100 text-red-700',
    bgColor: 'bg-red-100',
    title: 'Error',
  },
};

export const StatusMessage: React.FC<StatusMessageProps> = memo(({ status, message, show }) => {
  if (!show) return null;

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={cn("p-4 rounded-md border flex items-start animate-slideDown", config.colors)}>
      <div className={cn("mr-3 p-2 rounded-full", config.bgColor)}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <h4 className="font-medium mb-0.5">{config.title}</h4>
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
});

