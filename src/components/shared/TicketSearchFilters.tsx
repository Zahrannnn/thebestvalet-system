import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SortAsc, SortDesc } from "lucide-react";

type SortField = 'date' | 'ticketNumber' | 'price';
type SortDirection = 'asc' | 'desc';
type FilterOption = 'all' | 'paid' | 'unpaid';

interface TicketSearchFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterOption: FilterOption;
  onFilterChange: (value: FilterOption) => void;
  sortField: SortField;
  onSortFieldChange: (value: SortField) => void;
  sortDirection: SortDirection;
  onSortDirectionToggle: () => void;
  resultCount: number;
}

export const TicketSearchFilters: React.FC<TicketSearchFiltersProps> = ({
  searchTerm,
  onSearchChange,
  filterOption,
  onFilterChange,
  sortField,
  onSortFieldChange,
  sortDirection,
  onSortDirectionToggle,
  resultCount,
}) => {
  return (
    <div className="flex flex-col space-y-4 mb-4">
      <div className="flex flex-wrap gap-2">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="البحث في التذاكر..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="w-[150px]">
          <Select value={filterOption} onValueChange={(value) => onFilterChange(value as FilterOption)}>
            <SelectTrigger>
              <SelectValue placeholder="تصفية حسب" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع التذاكر</SelectItem>
              <SelectItem value="paid">المدفوعة فقط</SelectItem>
              <SelectItem value="unpaid">غير المدفوعة فقط</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-[180px]">
          <Select value={sortField} onValueChange={(value) => onSortFieldChange(value as SortField)}>
            <SelectTrigger>
              <SelectValue placeholder="ترتيب حسب" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">تاريخ الإصدار</SelectItem>
              <SelectItem value="ticketNumber">رقم التذكرة</SelectItem>
              <SelectItem value="price">السعر</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onSortDirectionToggle}
          className="h-10 w-10"
        >
          {sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
        </Button>
      </div>
      
      <div className="flex justify-between">
        <p className="text-sm text-gray-500">
          {resultCount} {resultCount === 1 ? 'تذكرة' : 'تذاكر'} تم العثور عليها
        </p>
      </div>
    </div>
  );
};

