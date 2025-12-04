import { useState, useCallback } from 'react';

interface UseTicketNumberInputOptions {
  maxLength?: number;
  onEnter?: (value: string) => void;
}

export function useTicketNumberInput(options: UseTicketNumberInputOptions = {}) {
  const { maxLength = 5, onEnter } = options;
  const [ticketNumber, setTicketNumber] = useState<string>("");

  const handleKeyPress = useCallback((key: string) => {
    setTicketNumber((prev) => prev.length < maxLength ? prev + key : prev);
  }, [maxLength]);

  const handleBackspace = useCallback(() => {
    setTicketNumber((prev) => prev.slice(0, -1));
  }, []);

  const handleClear = useCallback(() => {
    setTicketNumber("");
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key >= '0' && e.key <= '9') {
      setTicketNumber((prev) => prev.length < maxLength ? prev + e.key : prev);
    } else if (e.key === 'Backspace') {
      handleBackspace();
    } else if (e.key === 'Escape') {
      handleClear();
    } else if (e.key === 'Enter' && onEnter) {
      onEnter(ticketNumber);
    }
  }, [maxLength, handleBackspace, handleClear, onEnter, ticketNumber]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    const pasted = e.clipboardData.getData('Text').replace(/\D/g, '').slice(0, maxLength);
    setTicketNumber(pasted);
    e.preventDefault();
  }, [maxLength]);

  const reset = useCallback(() => {
    setTicketNumber("");
  }, []);

  return {
    ticketNumber,
    setTicketNumber,
    handleKeyPress,
    handleBackspace,
    handleClear,
    handleKeyDown,
    handlePaste,
    reset,
  };
}

