import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CarFront, Ticket } from "lucide-react";
import { TicketNumberInputs } from "@/components/shared/TicketNumberInputs";
import { StatusMessage } from "@/components/shared/StatusMessage";
import { useTicketNumberDigits } from "@/hooks/useTicketNumberDigits";
import { useCarRequestSubmission } from "@/hooks/useCarRequestSubmission";

const UserCarRequest: React.FC = () => {
  const {
    digits,
    handleDigitChange,
    handleKeyDown,
    handlePaste,
    clearDigits,
    getTicketNumber,
  } = useTicketNumberDigits();

  const {
    loading,
    status,
    message,
    showStatusMessage,
    submitRequest,
    resetStatus,
  } = useCarRequestSubmission();

  const handleRequestCar = async () => {
    const ticketNumber = getTicketNumber();
    await submitRequest(ticketNumber);
    if (status === 'success') {
      clearDigits();
    }
  };

  const handleClear = () => {
    clearDigits();
    resetStatus();
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
            <TicketNumberInputs
              digits={digits}
              onDigitChange={handleDigitChange}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onClear={handleClear}
              loading={loading}
            />
            
            {status !== 'idle' && (
              <StatusMessage
                status={status}
                message={message}
                show={showStatusMessage}
              />
            )}
          </CardContent>
          
          <CardFooter className="pt-2 pb-6">
            <Button 
              className="w-full h-12 text-base font-medium shadow-lg transition-all active:scale-98"
              onClick={handleRequestCar} 
              disabled={loading || digits.some(digit => digit === "")}
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