import { useState, useRef, useEffect, useCallback } from 'react';

export function useTicketNumberDigits() {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 5);
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleDigitChange = useCallback((index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    setDigits((prev) => {
      const newDigits = [...prev];
      newDigits[index] = value.slice(-1);
      
      if (value !== "" && index < 4) {
        inputRefs.current[index + 1]?.focus();
      }
      
      return newDigits;
    });
  }, []);

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    if (e.key === "ArrowRight" && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
    
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }, [digits]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    
    if (!/^\d+$/.test(pastedData)) return;
    
    const newDigits = pastedData.split("").slice(0, 5);
    const paddedDigits = [...newDigits, ...Array(5 - newDigits.length).fill("")];
    
    setDigits(paddedDigits);
    
    if (newDigits.length < 5) {
      inputRefs.current[newDigits.length]?.focus();
    } else {
      inputRefs.current[4]?.focus();
    }
  }, []);

  const clearDigits = useCallback(() => {
    setDigits(["", "", "", "", ""]);
    inputRefs.current[0]?.focus();
  }, []);

  const getTicketNumber = useCallback(() => {
    return digits.join("");
  }, [digits]);

  return {
    digits,
    inputRefs,
    handleDigitChange,
    handleKeyDown,
    handlePaste,
    clearDigits,
    getTicketNumber,
  };
}

