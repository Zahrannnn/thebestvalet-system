import React, { useState, useMemo } from 'react';
import { useValet } from "@/context/ValetContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Eye, SortAsc, SortDesc, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface TicketListProps {
  onSelectTicket: (ticketNumber: string) => void;
}

type SortField = 'date' | 'ticketNumber' | 'price';
type SortDirection = 'asc' | 'desc';
type FilterOption = 'all' | 'paid' | 'unpaid';

const TicketList: React.FC<TicketListProps> = ({ onSelectTicket }) => {
  const { state, updatePaymentStatus } = useValet();
  const { tickets } = state;
  
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterOption, setFilterOption] = useState<FilterOption>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      calendar: 'gregory'
    }).format(date);
  };

  const handleTogglePayment = (ticketId: string, isPaid: boolean) => {
    updatePaymentStatus(ticketId, !isPaid);
  };

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const filteredAndSortedTickets = useMemo(() => {
    // First filter the tickets
    let filtered = [...tickets];
    
    if (filterOption === 'paid') {
      filtered = filtered.filter(ticket => ticket.isPaid);
    } else if (filterOption === 'unpaid') {
      filtered = filtered.filter(ticket => !ticket.isPaid);
    }

    // Apply search filter if there's a search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(ticket => 
        ticket.ticketNumber.toLowerCase().includes(term) ||
        (ticket.instructions && ticket.instructions.toLowerCase().includes(term)) ||
        (ticket.ticketType && ticket.ticketType.toLowerCase().includes(term))
      );
    }
    
    // Then sort the filtered tickets
    return filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'date') {
        comparison = a.issueDate.getTime() - b.issueDate.getTime();
      } else if (sortField === 'ticketNumber') {
        comparison = a.ticketNumber.localeCompare(b.ticketNumber);
      } else if (sortField === 'price') {
        comparison = a.price - b.price;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [tickets, sortField, sortDirection, filterOption, searchTerm]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>جميع تذاكر المواقف</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4 mb-4">
          {/* Search and Filter Controls */}
          <div className="flex flex-wrap gap-2">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="البحث في التذاكر..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="w-[150px]">
              <Select value={filterOption} onValueChange={(value) => setFilterOption(value as FilterOption)}>
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
              <Select value={sortField} onValueChange={(value) => setSortField(value as SortField)}>
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
              onClick={toggleSortDirection}
              className="h-10 w-10"
            >
              {sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </Button>
          </div>
          
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">
              {filteredAndSortedTickets.length} {filteredAndSortedTickets.length === 1 ? 'تذكرة' : 'تذاكر'} تم العثور عليها
            </p>
          </div>
        </div>
        
        {filteredAndSortedTickets.length === 0 ? (
          <p className="text-center text-gray-500 py-8">لا توجد تذاكر تطابق معاييرك</p>
        ) : (
          <div className=" rounded-lg divide-y  ">
            {filteredAndSortedTickets.map((ticket) => (
              <div key={ticket.id} className="p-4 mb-4 bg-gradient-to-r from-amber-600/25 to-amber-300/10 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium ">تذكرة رقم #{ticket.ticketNumber}</p>
                    <p className="text-sm text-gray-500">{ticket.issueDate.toLocaleDateString('en-US', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}</p>
                    {ticket.ticketType && (
                      <p className="text-xs text-gray-600 mt-1">النوع: {ticket.ticketType}</p>
                    )}
                  </div>
                  
                  <div className="text-left flex flex-col items-start">
                    <p className="font-medium">${ticket.price.toFixed(2)}</p>
                    <div className="flex items-center space-x-reverse space-x-2 mt-1">
                      <span className={`text-sm ml-2 ${ticket.isPaid ? 'text-green-600' : 'text-red-600'}`}>
                        {ticket.isPaid ? "مدفوع" : "غير مدفوع"}
                      </span>
                     
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between mt-3 pt-2 border-t">
                  <div className="flex space-x-reverse space-x-2 ml-auto">
                   
                  </div>
                  
                  {ticket.instructions ? (
                    <p className="text-sm text-gray-600 flex-1 pl-4">
                      {ticket.instructions}
                    </p>
                  ) : (
                    <span className="text-sm text-gray-400 italic">لا توجد تعليمات</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TicketList; 