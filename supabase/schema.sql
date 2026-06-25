-- Mr Huevos POS Database Schema for Supabase
-- Complete schema including all modules: auth, inventory, sales, customers, accounts receivable, cash register, logistics

-- Create branches table
CREATE TABLE IF NOT EXISTS branches (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  branch_id INTEGER REFERENCES branches(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customers table with credit fields
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  account_balance DECIMAL(10,2) DEFAULT 0,
  credit_limit DECIMAL(10,2) DEFAULT 500,
  active BOOLEAN DEFAULT true,
  total_purchases DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table with branch support
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  cost_price DECIMAL(10,2) DEFAULT 0,
  retail_price DECIMAL(10,2) NOT NULL,
  wholesale_price DECIMAL(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  branch_id INTEGER REFERENCES branches(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  branch_id INTEGER REFERENCES branches(id),
  customer_id INTEGER REFERENCES customers(id),
  customer_name VARCHAR(100),
  customer_address TEXT,
  customer_phone VARCHAR(20),
  total DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(30) DEFAULT 'cash',
  is_for_delivery BOOLEAN DEFAULT false,
  delivery_date DATE,
  total_bultos INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sale_items table
CREATE TABLE IF NOT EXISTS sale_items (
  id SERIAL PRIMARY KEY,
  sale_id INTEGER REFERENCES sales(id),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL
);

-- Create cash_sessions table
CREATE TABLE IF NOT EXISTS cash_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  branch_id INTEGER REFERENCES branches(id),
  initial_cash DECIMAL(10,2) DEFAULT 0,
  final_cash DECIMAL(10,2),
  notes TEXT,
  difference DECIMAL(10,2),
  opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'open' -- open, closed
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES cash_sessions(id),
  branch_id INTEGER REFERENCES branches(id),
  user_id INTEGER REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create account_movements table
CREATE TABLE IF NOT EXISTS account_movements (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id),
  user_id INTEGER REFERENCES users(id),
  type VARCHAR(20) NOT NULL, -- 'sale' or 'payment'
  amount DECIMAL(10,2) NOT NULL,
  balance_after DECIMAL(10,2) NOT NULL,
  description TEXT,
  payment_method VARCHAR(30),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id SERIAL PRIMARY KEY,
  branch_id INTEGER NOT NULL REFERENCES branches(id),
  product_id INTEGER REFERENCES products(id),
  product_name VARCHAR(100) NOT NULL,
  supplier VARCHAR(120) NOT NULL,
  quantity INTEGER NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create spoilages table
CREATE TABLE IF NOT EXISTS spoilages (
  id SERIAL PRIMARY KEY,
  branch_id INTEGER REFERENCES branches(id),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  reason VARCHAR(50),
  notes TEXT,
  user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vehicles table for logistics
CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  license_plate VARCHAR(20),
  capacity INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create deliveries table for logistics
CREATE TABLE IF NOT EXISTS deliveries (
  id SERIAL PRIMARY KEY,
  sale_id INTEGER REFERENCES sales(id),
  customer_id INTEGER REFERENCES customers(id),
  customer_name VARCHAR(100) NOT NULL,
  customer_address TEXT,
  customer_phone VARCHAR(20),
  delivery_date DATE NOT NULL,
  vehicle_id INTEGER REFERENCES vehicles(id),
  route_order INTEGER,
  status VARCHAR(20) DEFAULT 'pending',
  total_bultos INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_branch ON products(branch_id);
CREATE INDEX IF NOT EXISTS idx_sales_branch_created_at ON sales(branch_id, created_at);
CREATE INDEX IF NOT EXISTS idx_sales_payment_method ON sales(payment_method);
CREATE INDEX IF NOT EXISTS idx_purchases_branch_created_at ON purchases(branch_id, created_at);
CREATE INDEX IF NOT EXISTS idx_deliveries_date ON deliveries(delivery_date);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_vehicle ON deliveries(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_account_movements_customer ON account_movements(customer_id);
CREATE INDEX IF NOT EXISTS idx_expenses_session ON expenses(session_id);

-- Insert default admin user (password: admin123 - hashed with bcrypt)
INSERT INTO users (username, password_hash, role, branch_id) VALUES 
('admin', '$2b$10$rQZ9vXJXLqKjQvJz8VqYp.4xN5yF8hN9kL2mP6tR8sU0vW2xY4zA.', 'admin', 1),
('encargado', '$2b$10$manager_hash_placeholder', 'manager', 1),
('vendedor', '$2b$10$seller_hash_placeholder', 'seller', 2)
ON CONFLICT (username) DO NOTHING;

-- Insert default branch
INSERT INTO branches (name, address, phone) VALUES
('Centenario', 'Av. Principal 123', '555-0001'),
('Caaguazú', 'Calle Secundaria 456', '555-0002')
ON CONFLICT DO NOTHING;

-- Insert sample products
INSERT INTO products (name, cost_price, retail_price, wholesale_price, stock, branch_id) VALUES
('Huevo Blanco (30u)', 3.50, 4.50, 4.00, 100, 1),
('Huevo Rojo (30u)', 3.80, 4.80, 4.30, 80, 1),
('Huevo Orgánico (15u)', 2.20, 3.20, 2.80, 50, 1),
('Huevo de Codorniz (24u)', 1.80, 2.50, 2.20, 60, 1),
('Huevo Azul (30u)', 4.00, 5.00, 4.50, 40, 1),
('Cartón Vacío', 0.30, 0.50, 0.40, 200, 1)
ON CONFLICT DO NOTHING;

-- Insert sample vehicles
INSERT INTO vehicles (name, license_plate, capacity) VALUES
('Camión A - Grande', 'ABC-123', 500),
('Camión B - Mediano', 'DEF-456', 300),
('Furgoneta C - Pequeña', 'GHI-789', 100)
ON CONFLICT DO NOTHING;
