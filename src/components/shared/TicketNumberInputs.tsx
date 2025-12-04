import React, { useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { KeyRound, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TicketNumberInputsProps {
  digits: string[];
  onDigitChange: (index: number, value: string) => void;
  onKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  onPaste: (e: React.ClipboardEvent) => void;
  onClear: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export const TicketNumberInputs: React.FC<TicketNumberInputsProps> = ({
  digits,
  onDigitChange,
  onKeyDown,
  onPaste,
  onClear,
  loading = false,
  disabled = false,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 5);
    if (inputRefs.current[0] && !disabled) {
      inputRefs.current[0].focus();
    }
  }, [disabled]);

  return (
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
                digits[index] ? "border-primary/70 bg-primary/5" : "border-muted",
                loading && "opacity-70"
              )}
              value={digits[index]}
              onChange={(e) => onDigitChange(index, e.target.value)}
              onKeyDown={(e) => onKeyDown(index, e)}
              onPaste={index === 0 ? onPaste : undefined}
              disabled={loading || disabled}
              ref={(el) => (inputRefs.current[index] = el)}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-3">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onClear}
          disabled={loading || disabled || digits.every(digit => digit === "")}
          className="text-xs gap-1 h-8 active:scale-95 transition-transform"
        >
          <X className="h-3.5 w-3.5" /> Clear
        </Button>
      </div>
    </div>
  );
};

