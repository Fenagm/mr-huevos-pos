-- Logistics Module Schema Extensions

-- Create vehicles table for the fleet
CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  license_plate VARCHAR(20),
  capacity INTEGER NOT NULL DEFAULT 0, -- Maximum capacity in maples/bultos
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create deliveries table for scheduled shipments
CREATE TABLE IF NOT EXISTS deliveries (
  id SERIAL PRIMARY KEY,
  sale_id INTEGER REFERENCES sales(id),
  customer_id INTEGER REFERENCES customers(id),
  customer_name VARCHAR(100) NOT NULL,
  customer_address TEXT,
  customer_phone VARCHAR(20),
  delivery_date DATE NOT NULL,
  vehicle_id INTEGER REFERENCES vehicles(id),
  route_order INTEGER, -- Order in the route (1, 2, 3, etc.)
  status VARCHAR(20) DEFAULT 'pending', -- pending, assigned, in_transit, delivered, cancelled
  total_bultos INTEGER DEFAULT 0, -- Total maples/bultos for this delivery
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient date-based queries
CREATE INDEX IF NOT EXISTS idx_deliveries_date ON deliveries(delivery_date);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_vehicle ON deliveries(vehicle_id);

-- Insert sample vehicles
INSERT INTO vehicles (name, license_plate, capacity) VALUES
('Camión A - Grande', 'ABC-123', 500),
('Camión B - Mediano', 'DEF-456', 300),
('Furgoneta C - Pequeña', 'GHI-789', 100)
ON CONFLICT DO NOTHING;

-- Add is_for_delivery and delivery_date columns to sales (optional tracking)
ALTER TABLE sales ADD COLUMN IF NOT EXISTS is_for_delivery BOOLEAN DEFAULT false;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS delivery_date DATE;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES customers(id);
ALTER TABLE sales ADD COLUMN IF NOT EXISTS customer_address TEXT;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS total_bultos INTEGER DEFAULT 0;
