-- Add payment_method column to tickets table
ALTER TABLE tickets ADD COLUMN payment_method TEXT;

-- Create index for payment method analysis
CREATE INDEX idx_tickets_payment_method ON tickets(payment_method); 