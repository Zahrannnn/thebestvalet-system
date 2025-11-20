-- Create database extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables
CREATE TABLE IF NOT EXISTS bottles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  size_ml NUMERIC NOT NULL,
  cost_per_unit NUMERIC NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS oils (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  stock_ml NUMERIC NOT NULL DEFAULT 0,
  cost_per_ml NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), 
  oil_id UUID REFERENCES oils(id),
  bottle_id UUID REFERENCES bottles(id),
  oil_amount_ml NUMERIC NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC NOT NULL,
  total_amount NUMERIC NOT NULL,
  sale_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  oil_id UUID REFERENCES oils(id),
  amount_ml NUMERIC NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('sale', 'purchase', 'adjustment')),
  reference_id TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number TEXT NOT NULL,
  price NUMERIC NOT NULL,
  company_name TEXT NOT NULL,
  is_paid BOOLEAN DEFAULT FALSE,
  issue_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  instructions TEXT,
  ticket_type TEXT
);

CREATE TABLE IF NOT EXISTS car_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID REFERENCES tickets(id),
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'completed')),
  request_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create enum type
CREATE TYPE transaction_type AS ENUM ('sale', 'purchase', 'adjustment');

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_car_requests_ticket_id ON car_requests(ticket_id);
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_number ON tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_sales_oil_id ON sales(oil_id);
CREATE INDEX IF NOT EXISTS idx_sales_bottle_id ON sales(bottle_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_oil_id ON stock_movements(oil_id); 