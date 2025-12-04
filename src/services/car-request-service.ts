import { supabase } from "@/integrations/supabase/client";
import type { CarRequest } from "@/context/ValetContext";


interface DatabaseCarRequest {
  id: string;
  ticket_id: string | null;
  status: string;
  request_time: string | null;
}


function formatCarRequest(dbRequest: DatabaseCarRequest): CarRequest {
  return {
    id: dbRequest.id,
    ticketId: dbRequest.ticket_id || '',
    status: dbRequest.status as 'pending' | 'accepted' | 'completed',
    requestTime: new Date(dbRequest.request_time || Date.now()),
  };
}


export async function fetchAllCarRequests(): Promise<CarRequest[]> {
  const { data, error } = await supabase
    .from('car_requests')
    .select('*');

  if (error) {
    console.error('Error fetching car requests:', error);
    throw error;
  }

  if (!data) {
    return [];
  }

  return data.map(formatCarRequest);
}


export async function createCarRequest(ticketId: string): Promise<CarRequest> {
  const { data, error } = await supabase
    .from('car_requests')
    .insert({
      ticket_id: ticketId,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating car request:', error);
    throw error;
  }

  return formatCarRequest(data);
}


export async function updateCarRequestStatus(
  requestId: string,
  status: 'pending' | 'accepted' | 'completed'
): Promise<void> {
  const { error } = await supabase
    .from('car_requests')
    .update({ status })
    .eq('id', requestId);

  if (error) {
    console.error('Error updating request status:', error);
    throw error;
  }
}


export async function deleteCarRequestsByTicketId(ticketId: string): Promise<void> {
  const { error } = await supabase
    .from('car_requests')
    .delete()
    .eq('ticket_id', ticketId);

  if (error) {
    console.error('Error deleting car requests:', error);
    throw error;
  }
}


export async function fetchTicketNumbersByIds(ticketIds: string[]): Promise<Record<string, { ticketNumber: string; price: number }>> {
  if (ticketIds.length === 0) {
    return {};
  }

  const { data, error } = await supabase
    .from('tickets')
    .select('id, ticket_number, price')
    .in('id', ticketIds);

  if (error) {
    console.error('Error fetching ticket numbers:', error);
    throw error;
  }

  if (!data) {
    return {};
  }

  const result: Record<string, { ticketNumber: string; price: number }> = {};
  data.forEach(ticket => {
    result[ticket.id] = {
      ticketNumber: ticket.ticket_number,
      price: Number(ticket.price),
    };
  });

  return result;
}

