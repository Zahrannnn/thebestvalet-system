-- Seed data for bottles (perfume bottles)
INSERT INTO bottles (name, size_ml, cost_per_unit, stock)
VALUES 
  ('Small Bottle', 30, 5.00, 100),
  ('Medium Bottle', 50, 8.00, 75),
  ('Large Bottle', 100, 12.00, 50);

-- Seed data for oils (perfume oils)
INSERT INTO oils (name, stock_ml, cost_per_ml)
VALUES 
  ('Lavender', 5000, 0.10),
  ('Rose', 3000, 0.25),
  ('Sandalwood', 2000, 0.30),
  ('Vanilla', 4000, 0.15),
  ('Jasmine', 1500, 0.40);

-- Sample tickets
INSERT INTO tickets (ticket_number, price, company_name, is_paid, ticket_type)
VALUES 
  ('12345', 25.00, 'Valet Parking Pro', TRUE, 'standard'),
  ('23456', 35.00, 'Valet Parking Pro', FALSE, 'premium'),
  ('34567', 25.00, 'Valet Parking Pro', FALSE, 'standard');

-- Sample car requests
INSERT INTO car_requests (ticket_id, status)
VALUES 
  ((SELECT id FROM tickets WHERE ticket_number = '12345'), 'completed'),
  ((SELECT id FROM tickets WHERE ticket_number = '23456'), 'accepted'); 