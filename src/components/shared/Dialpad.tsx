import React from 'react';
import { Button } from "@/components/ui/button";

interface DialpadProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  disabled?: boolean;
}

export const Dialpad: React.FC<DialpadProps> = ({
  onKeyPress,
  onBackspace,
  onClear,
  disabled = false,
}) => {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

  const handleKeyClick = (key: string) => {
    if (key === "⌫") {
      onBackspace();
    } else if (key === "") {
      // Empty cell for layout
    } else {
      onKeyPress(key);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto mt-4">
        {keys.map((key, idx) => (
          <Button
            key={idx}
            variant="outline"
            className="text-lg py-6 transition-transform active:scale-95 focus:scale-95"
            aria-label={key === '⌫' ? 'حذف رقم' : key === '' ? undefined : `رقم ${key}`}
            onClick={() => handleKeyClick(key)}
            disabled={key === "" || disabled}
            tabIndex={-1}
          >
            {key}
          </Button>
        ))}
        <Button
          variant="destructive"
          className="col-span-3 mt-2"
          onClick={onClear}
          tabIndex={-1}
          disabled={disabled}
        >
          مسح الكل
        </Button>
      </div>
    </div>
  );
};

