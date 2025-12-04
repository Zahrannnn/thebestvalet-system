import React from 'react';

interface TicketNumberDisplayProps {
  value: string;
  placeholder?: string;
  className?: string;
}

export const TicketNumberDisplay: React.FC<TicketNumberDisplayProps> = ({
  value,
  placeholder = "00000",
  className = "",
}) => {
  return (
    <div className={`flex justify-center items-center my-2 ${className}`}>
      <span className="text-3xl font-mono tracking-widest bg-gray-100 rounded px-4 py-2 min-w-[120px] text-center select-all">
        {value || <span className="text-gray-400">{placeholder}</span>}
      </span>
    </div>
  );
};

