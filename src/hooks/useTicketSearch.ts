import { useState, useCallback } from 'react';
import { toast } from "@/components/ui/use-toast";
import type { Ticket } from '@/context/ValetContext';

export function useTicketSearch(tickets: Ticket[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Ticket[]>([]);

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const filtered = tickets.filter((ticket) =>
      ticket.ticketNumber.includes(searchQuery.trim())
    );

    if (filtered.length === 0) {
      toast({
        title: "لا توجد نتائج",
        description: "لم يتم العثور على تذاكر مطابقة لبحثك.",
      });
    }

    setSearchResults(filtered);
  }, [searchQuery, tickets]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    handleSearch,
    clearSearch,
  };
}

