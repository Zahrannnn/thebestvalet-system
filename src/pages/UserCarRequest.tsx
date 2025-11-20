import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { CarFront, CheckCircle, AlertCircle, Ticket, X, KeyRound, Clock, Car } from "lucide-react";
import { cn } from "@/lib/utils";

const UserCarRequest: React.FC = () => {
  const [ticketDigits, setTicketDigits] = useState<string[]>(["", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [requestStatus, setRequestStatus] = useState<'idle' | 'success' | 'error' | 'exists'>('idle');
  const [message, setMessage] = useState<string>("");
  const [showStatusMessage, setShowStatusMessage] = useState<boolean>(false);

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 5);
    // Focus first input on component mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Show message with animation when status changes
  useEffect(() => {
    if (requestStatus !== 'idle') {
      setShowStatusMessage(true);
    } else {
      setShowStatusMessage(false);
    }
  }, [requestStatus]);

  const handleDigitChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newTicketDigits = [...ticketDigits];
    // Take only the last character if multiple are pasted
    newTicketDigits[index] = value.slice(-1);
    setTicketDigits(newTicketDigits);

    // Auto-focus next input if value was entered
    if (value !== "" && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace to move to previous input
    if (e.key === "Backspace" && !ticketDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle right arrow navigation
    if (e.key === "ArrowRight" && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Handle left arrow navigation
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    
    // Check if pasted content is all digits
    if (!/^\d+$/.test(pastedData)) return;
    
    const digits = pastedData.split("").slice(0, 5);
    const newTicketDigits = [...ticketDigits];
    
    digits.forEach((digit, index) => {
      if (index < 5) {
        newTicketDigits[index] = digit;
      }
    });
    
    setTicketDigits(newTicketDigits);
    
    // Focus appropriate input after pasting
    if (digits.length < 5) {
      inputRefs.current[digits.length]?.focus();
    } else {
      inputRefs.current[4]?.focus();
    }
  };

  const handleRequestCar = async () => {
    const ticketNumber = ticketDigits.join("");
    
    if (ticketNumber.length !== 5) {
      setRequestStatus('error');
      setMessage("Please enter a complete 5-digit ticket number.");
      return;
    }

    setLoading(true);
    setRequestStatus('idle');
    setMessage("");

    try {
      // First, find the ticket by number
      const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .select('id')
        .eq('ticket_number', ticketNumber)
        .single();

      if (ticketError || !ticketData) {
        setRequestStatus('error');
        setMessage("Invalid ticket number. Please check and try again.");
        setLoading(false);
        return;
      }

      // CRITICAL: Reconfirm that the ticket still exists to prevent race conditions
      try {
        const { count, error: countError } = await supabase
          .from('tickets')
          .select('id', { count: 'exact', head: true })
          .eq('id', ticketData.id);
          
        if (countError || !count || count === 0) {
          console.error('Ticket exists check failed:', countError || 'Ticket was not found on recheck');
          setRequestStatus('error');
          setMessage("This ticket has been deleted or is no longer valid.");
          setLoading(false);
          return;
        }
      } catch (recheckErr) {
        console.error('Error during ticket revalidation:', recheckErr);
      }

      // Check if there's already an active request for this ticket
      const { data: existingRequests, error: requestError } = await supabase
        .from('car_requests')
        .select('id, status')
        .eq('ticket_id', ticketData.id);

      if (existingRequests && existingRequests.length > 0) {
        // Check for any requests in any status
        const completedRequest = existingRequests.find(req => req.status === 'completed');
        if (completedRequest) {
          setRequestStatus('error');
          setMessage("This car has already been retrieved and cannot be requested again.");
          setLoading(false);
          return;
        }

        // Check for pending or accepted requests
        const activeRequest = existingRequests.find(req => 
          req.status === 'pending' || req.status === 'accepted'
        );
        
        if (activeRequest) {
          setRequestStatus('exists');
          setMessage(
            activeRequest.status === 'pending' 
              ? "Your car has already been requested and is waiting for a valet." 
              : "Your car is currently being retrieved by the valet."
          );
          setLoading(false);
          return;
        }
      }

      // Create a new car request
      const { error: insertError } = await supabase
        .from('car_requests')
        .insert({
          ticket_id: ticketData.id,
          status: 'pending'
        });

      if (insertError) {
        setRequestStatus('error');
        setMessage("Failed to create car request. Please try again or contact the valet service.");
        console.error('Error creating car request:', insertError);
      } else {
        setRequestStatus('success');
        setMessage(`Your request for car #${ticketNumber} has been sent to the valet.`);
        setTicketDigits(["", "", "", "", ""]);
        // Focus first input after successful submission
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      console.error('Error requesting car:', err);
      setRequestStatus('error');
      setMessage("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const clearTicket = () => {
    setTicketDigits(["", "", "", "", ""]);
    inputRefs.current[0]?.focus();
    // Reset status when clearing
    if (requestStatus !== 'idle') {
      setRequestStatus('idle');
      setMessage("");
    }
  };

  const getStatusIcon = () => {
    switch (requestStatus) {
      case 'success':
        return <Car className="h-6 w-6" />;
      case 'exists':
        return <Clock className="h-6 w-6" />;
      case 'error':
        return <AlertCircle className="h-6 w-6" />;
      default:
        return null;
    }
  };

  const getStatusColors = () => {
    switch (requestStatus) {
      case 'success':
        return 'bg-green-50 border-green-100 text-green-700';
      case 'exists':
        return 'bg-blue-50 border-blue-100 text-blue-700';
      case 'error':
        return 'bg-red-50 border-red-100 text-red-700';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md animate-fadeIn">
        <Card className="border-t-4 border-t-primary shadow-xl overflow-hidden">
          <CardHeader className="text-center pb-2">
            <div className="relative mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 shadow-inner">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/30 animate-spin-slow"></div>
              <Ticket className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">The Best Valet Car Request</CardTitle>
            <CardDescription className="text-muted-foreground text-base mt-1">
              Enter your 5-digit ticket number to retrieve your car
              <p className="text-[10px] text-muted-foreground">
              سيتم توفر السيارة في غضون 10 دقائق، وأي وقت إضافي في الانتظار سيؤدي إلى رسوم إضافية

              </p>
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-4">
            <div className="space-y-3">
              <Label htmlFor="ticketNumber" className="text-sm font-medium flex items-center gap-1.5">
                <KeyRound className="h-4 w-4 text-primary/70" /> Ticket Number
              </Label>
              <div className="flex justify-between mt-1 gap-2">
                {[0, 1, 2, 3, 4].map((index) => (
                  <div 
                    key={index}
                    className="flex-1 active:scale-95 transition-transform"
                  >
                    <Input
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className={cn(
                        "w-full aspect-square text-center text-xl font-bold border-2 transition-all",
                        ticketDigits[index] ? "border-primary/70 bg-primary/5" : "border-muted",
                        loading && "opacity-70"
                      )}
                      value={ticketDigits[index]}
                      onChange={(e) => handleDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      disabled={loading}
                      ref={(el) => (inputRefs.current[index] = el)}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearTicket}
                  disabled={loading || ticketDigits.every(digit => digit === "")}
                  className="text-xs gap-1 h-8 active:scale-95 transition-transform"
                >
                  <X className="h-3.5 w-3.5" /> Clear
                </Button>
              </div>
            </div>
            
            {showStatusMessage && (
              <div className={`p-4 rounded-md border ${getStatusColors()} flex items-start animate-slideDown`}>
                <div className={`mr-3 p-2 rounded-full ${
                  requestStatus === 'success' ? 'bg-green-100' : 
                  requestStatus === 'exists' ? 'bg-blue-100' : 
                  'bg-red-100'
                }`}>
                  {getStatusIcon()}
                </div>
                <div>
                  <h4 className="font-medium mb-0.5">
                    {requestStatus === 'success' ? 'Success!' : 
                     requestStatus === 'exists' ? 'Already Requested' : 
                     'Error'}
                  </h4>
                  <p className="text-sm">{message}</p>
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="pt-2 pb-6">
            <Button 
              className="w-full h-12 text-base font-medium shadow-lg transition-all active:scale-98"
              onClick={handleRequestCar} 
              disabled={loading || ticketDigits.some(digit => digit === "")}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <CarFront className="h-5 w-5 animate-spin" />
                  Requesting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CarFront className="h-5 w-5" /> Request My Car
                </span>
              )}
            </Button>
          </CardFooter>
        </Card>
        
        <div className="mt-8 text-center space-y-1">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} The Best Valet Parking System
          </p>
          <p className="text-xs text-muted-foreground/70">
            Owned by Abdul Rahman Saad
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserCarRequest; 