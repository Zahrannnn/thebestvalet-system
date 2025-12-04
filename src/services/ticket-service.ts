import { supabase } from "@/integrations/supabase/client";
import type { Ticket } from "@/context/ValetContext";


interface DatabaseTicket {
  id: string;
  ticket_number: string;
  price: number;
  company_name: string;
  is_paid: boolean | null;
  issue_date: string | null;
  instructions: string | null;
  ticket_type: string | null;
  payment_method: string | null;
}


function formatTicket(dbTicket: DatabaseTicket): Ticket {
  return {
    id: dbTicket.id,
    ticketNumber: dbTicket.ticket_number,
    price: Number(dbTicket.price),
    issueDate: new Date(dbTicket.issue_date || Date.now()),
    companyName: dbTicket.company_name,
    isPaid: dbTicket.is_paid ?? false,
    instructions: dbTicket.instructions ?? undefined,
    ticketType: dbTicket.ticket_type ?? undefined,
    paymentMethod: dbTicket.payment_method ?? undefined,
  };
}


export async function fetchAllTickets(): Promise<Ticket[]> {
  const { data, error } = await supabase
    .from('tickets')
    .select('*');

  if (error) {
    console.error('Error fetching tickets:', error);
    throw error;
  }

  if (!data) {
    return [];
  }

  return data.map(formatTicket);
}


export async function createTicket(params: {
  ticketNumber: string;
  price: number;
  ticketType: string;
  instructions?: string;
  companyName?: string;
}): Promise<Ticket> {
  const { data, error } = await supabase
    .from('tickets')
    .insert({
      ticket_number: params.ticketNumber,
      price: params.price,
      company_name: params.companyName || "Valet Parking Pro",
      is_paid: false,
      instructions: params.instructions,
      ticket_type: params.ticketType,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating ticket:', error);
    throw error;
  }

  return formatTicket(data);
}


export async function updateTicketPayment(
  ticketId: string,
  isPaid: boolean,
  paymentMethod?: string
): Promise<void> {
  const { error } = await supabase
    .from('tickets')
    .update({
      is_paid: isPaid,
      payment_method: paymentMethod,
    })
    .eq('id', ticketId);

  if (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
}


export async function deleteTicket(ticketId: string): Promise<void> {
  // First, delete all car requests for this ticket
  const { error: requestsError } = await supabase
    .from('car_requests')
    .delete()
    .eq('ticket_id', ticketId);

  if (requestsError) {
    console.error('Failed to delete car requests:', requestsError);
    throw requestsError;
  }

  // Then delete the ticket itself
  const { error: ticketError } = await supabase
    .from('tickets')
    .delete()
    .eq('id', ticketId);

  if (ticketError) {
    console.error('Failed to delete ticket:', ticketError);
    throw ticketError;
  }
}


export async function fetchTicketsByDateRange(
  startDate: string,
  isPaid?: boolean
): Promise<Ticket[]> {
  let query = supabase
    .from('tickets')
    .select('*')
    .gte('issue_date', startDate);

  if (isPaid !== undefined) {
    query = query.eq('is_paid', isPaid);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching tickets by date range:', error);
    throw error;
  }

  if (!data) {
    return [];
  }

  return data.map(formatTicket);
}

export async function fetchTicketByNumber(ticketNumber: string): Promise<Ticket | null> {
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('ticket_number', ticketNumber)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    console.error('Error fetching ticket by number:', error);
    throw error;
  }

  if (!data) {
    return null;
  }

  return formatTicket(data);
}

