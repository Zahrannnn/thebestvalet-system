// Constants for ticket prices
// Each price is in Kuwaiti Dinar (KWD)

export const TICKET_PRICES = {
  STANDARD: 2.0,  // Standard parking ticket
  PREMIUM: 3.0,   // Premium parking ticket with priority service
  VIP: 5.0,       // VIP parking with reserved spot and additional services
  EVENT: 2.5,     // Special event parking
} as const;

// Helper function to get price by ticket type
export function getTicketPrice(ticketType: string): number {
  const type = ticketType.toUpperCase();
  return type in TICKET_PRICES 
    ? TICKET_PRICES[type as keyof typeof TICKET_PRICES] 
    : TICKET_PRICES.STANDARD; // Default to standard if type not found
} 