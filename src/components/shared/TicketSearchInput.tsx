import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface TicketSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
  className?: string;
}

export const TicketSearchInput: React.FC<TicketSearchInputProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = "أدخل رقم التذكرة",
  className = "",
}) => {
  return (
    <div className={`flex space-x-2 space-x-reverse ${className}`}>
      <div className="flex-1">
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSearch();
          }}
          className="bg-white border-amber-300 text-amber-900 placeholder:text-amber-400/50"
        />
      </div>
      <Button
        onClick={onSearch}
        className="flex items-center bg-amber-600 text-white hover:bg-amber-700"
      >
        <Search className="h-4 w-4 ml-2" /> بحث
      </Button>
    </div>
  );
};

