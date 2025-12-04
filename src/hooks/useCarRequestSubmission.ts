import { useState, useCallback } from 'react';
import { createCarRequest, fetchAllCarRequests } from '@/services/car-request-service';
import { fetchTicketByNumber } from '@/services/ticket-service';
import { supabase } from '@/integrations/supabase/client';

type RequestStatus = 'idle' | 'success' | 'error' | 'exists';

interface UseCarRequestSubmissionResult {
  loading: boolean;
  status: RequestStatus;
  message: string;
  showStatusMessage: boolean;
  submitRequest: (ticketNumber: string) => Promise<void>;
  resetStatus: () => void;
}

export function useCarRequestSubmission(): UseCarRequestSubmissionResult {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [message, setMessage] = useState("");
  const [showStatusMessage, setShowStatusMessage] = useState(false);

  const submitRequest = useCallback(async (ticketNumber: string) => {
    if (ticketNumber.length !== 5) {
      setStatus('error');
      setMessage("Please enter a complete 5-digit ticket number.");
      setShowStatusMessage(true);
      return;
    }

    setLoading(true);
    setStatus('idle');
    setMessage("");

    try {
      // Find ticket by number
      const ticket = await fetchTicketByNumber(ticketNumber);

      if (!ticket) {
        setStatus('error');
        setMessage("Invalid ticket number. Please check and try again.");
        setLoading(false);
        setShowStatusMessage(true);
        return;
      }

      // Reconfirm ticket exists
      const { count, error: countError } = await supabase
        .from('tickets')
        .select('id', { count: 'exact', head: true })
        .eq('id', ticket.id);
        
      if (countError || !count || count === 0) {
        setStatus('error');
        setMessage("This ticket has been deleted or is no longer valid.");
        setLoading(false);
        setShowStatusMessage(true);
        return;
      }

      // Check for existing requests
      const { data: existingRequests, error: requestError } = await supabase
        .from('car_requests')
        .select('id, status')
        .eq('ticket_id', ticket.id);

      if (existingRequests && existingRequests.length > 0) {
        const completedRequest = existingRequests.find(req => req.status === 'completed');
        if (completedRequest) {
          setStatus('error');
          setMessage("This car has already been retrieved and cannot be requested again.");
          setLoading(false);
          setShowStatusMessage(true);
          return;
        }

        const activeRequest = existingRequests.find(req => 
          req.status === 'pending' || req.status === 'accepted'
        );
        
        if (activeRequest) {
          setStatus('exists');
          setMessage(
            activeRequest.status === 'pending' 
              ? "Your car has already been requested and is waiting for a valet." 
              : "Your car is currently being retrieved by the valet."
          );
          setLoading(false);
          setShowStatusMessage(true);
          return;
        }
      }

      // Create new car request
      await createCarRequest(ticket.id);
      setStatus('success');
      setMessage(`Your request for car #${ticketNumber} has been sent to the valet.`);
      setShowStatusMessage(true);
    } catch (err: any) {
      console.error('Error requesting car:', err);
      setStatus('error');
      setMessage(err.message || "An unexpected error occurred. Please try again later.");
      setShowStatusMessage(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const resetStatus = useCallback(() => {
    setStatus('idle');
    setMessage("");
    setShowStatusMessage(false);
  }, []);

  return {
    loading,
    status,
    message,
    showStatusMessage,
    submitRequest,
    resetStatus,
  };
}

