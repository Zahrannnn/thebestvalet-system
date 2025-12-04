import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PeriodFilterProps {
  value: "today" | "week" | "month";
  onChange: (value: "today" | "week" | "month") => void;
  className?: string;
}

export const PeriodFilter: React.FC<PeriodFilterProps> = ({
  value,
  onChange,
  className = "w-36",
}) => {
  return (
    <Select
      value={value}
      onValueChange={(val) => onChange(val as "today" | "week" | "month")}
    >
      <SelectTrigger className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="today">اليوم</SelectItem>
        <SelectItem value="week">آخر أسبوع</SelectItem>
        <SelectItem value="month">آخر شهر</SelectItem>
      </SelectContent>
    </Select>
  );
};

