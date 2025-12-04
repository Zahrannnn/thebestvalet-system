import { useState, useMemo, useCallback } from 'react';
import type { Ticket } from '@/context/ValetContext';

type SortField = 'date' | 'ticketNumber' | 'price';
type SortDirection = 'asc' | 'desc';
type FilterOption = 'all' | 'paid' | 'unpaid';

export function useTicketFilters(tickets: Ticket[]) {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterOption, setFilterOption] = useState<FilterOption>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const toggleSortDirection = useCallback(() => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  }, []);

  const filteredAndSortedTickets = useMemo(() => {
    let filtered = [...tickets];
    
    if (filterOption === 'paid') {
      filtered = filtered.filter(ticket => ticket.isPaid);
    } else if (filterOption === 'unpaid') {
      filtered = filtered.filter(ticket => !ticket.isPaid);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(ticket => 
        ticket.ticketNumber.toLowerCase().includes(term) ||
        (ticket.instructions && ticket.instructions.toLowerCase().includes(term)) ||
        (ticket.ticketType && ticket.ticketType.toLowerCase().includes(term))
      );
    }
    
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

  return {
    sortField,
    setSortField,
    sortDirection,
    toggleSortDirection,
    filterOption,
    setFilterOption,
    searchTerm,
    setSearchTerm,
    filteredAndSortedTickets,
  };
}

