import React from 'react';
import { useValet } from "@/context/ValetContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TicketSearchFilters } from "@/components/shared/TicketSearchFilters";
import { TicketCard } from "@/components/shared/TicketCard";
import { useTicketFilters } from "@/hooks/useTicketFilters";

interface TicketListProps {
  onSelectTicket: (ticketNumber: string) => void;
}

type SortField = 'date' | 'ticketNumber' | 'price';
type SortDirection = 'asc' | 'desc';
type FilterOption = 'all' | 'paid' | 'unpaid';

const TicketList: React.FC<TicketListProps> = ({ onSelectTicket }) => {
  const { state } = useValet();
  const { tickets } = state;
  
  const {
    sortField,
    setSortField,
    sortDirection,
    toggleSortDirection,
    filterOption,
    setFilterOption,
    searchTerm,
    setSearchTerm,
    filteredAndSortedTickets,
  } = useTicketFilters(tickets);

  return (
    <Card>
      <CardHeader>
        <CardTitle>جميع تذاكر المواقف</CardTitle>
      </CardHeader>
      <CardContent>
        <TicketSearchFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterOption={filterOption}
          onFilterChange={setFilterOption}
          sortField={sortField}
          onSortFieldChange={setSortField}
          sortDirection={sortDirection}
          onSortDirectionToggle={toggleSortDirection}
          resultCount={filteredAndSortedTickets.length}
        />
        
        {filteredAndSortedTickets.length === 0 ? (
          <p className="text-center text-gray-500 py-8">لا توجد تذاكر تطابق معاييرك</p>
        ) : (
          <div className="rounded-lg divide-y">
            {filteredAndSortedTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onSelect={onSelectTicket}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TicketList; 