-- Enable Row Level Security
ALTER TABLE bottles ENABLE ROW LEVEL SECURITY;
ALTER TABLE oils ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access (for demo purposes)
-- In a production environment, you would restrict this to authenticated users

-- Bottles policies
CREATE POLICY "Allow anonymous select on bottles" 
  ON bottles FOR SELECT 
  USING (true);

CREATE POLICY "Allow anonymous insert on bottles" 
  ON bottles FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update on bottles" 
  ON bottles FOR UPDATE 
  USING (true);

-- Oils policies
CREATE POLICY "Allow anonymous select on oils" 
  ON oils FOR SELECT 
  USING (true);

CREATE POLICY "Allow anonymous insert on oils" 
  ON oils FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update on oils" 
  ON oils FOR UPDATE 
  USING (true);

-- Sales policies
CREATE POLICY "Allow anonymous select on sales" 
  ON sales FOR SELECT 
  USING (true);

CREATE POLICY "Allow anonymous insert on sales" 
  ON sales FOR INSERT 
  WITH CHECK (true);

-- Stock movements policies
CREATE POLICY "Allow anonymous select on stock_movements" 
  ON stock_movements FOR SELECT 
  USING (true);

CREATE POLICY "Allow anonymous insert on stock_movements" 
  ON stock_movements FOR INSERT 
  WITH CHECK (true);

-- Tickets policies
CREATE POLICY "Allow anonymous select on tickets" 
  ON tickets FOR SELECT 
  USING (true);

CREATE POLICY "Allow anonymous insert on tickets" 
  ON tickets FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update on tickets" 
  ON tickets FOR UPDATE 
  USING (true);

-- Car requests policies
CREATE POLICY "Allow anonymous select on car_requests" 
  ON car_requests FOR SELECT 
  USING (true);

CREATE POLICY "Allow anonymous insert on car_requests" 
  ON car_requests FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update on car_requests" 
  ON car_requests FOR UPDATE 
  USING (true); 