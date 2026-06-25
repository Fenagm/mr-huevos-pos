-- Mr Huevos POS Database Schema for Supabase

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  total_purchases DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  total DECIMAL(10,2) NOT NULL,
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

-- Insert default admin user (password: admin123)
INSERT INTO users (username, password_hash, role) VALUES 
('admin', '$2b$10$rQZ9vXJXLqKjQvJz8VqYp.4xN5yF8hN9kL2mP6tR8sU0vW2xY4zA.', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, price, stock) VALUES
('Huevo Blanco (30u)', 4.50, 100),
('Huevo Rojo (30u)', 4.80, 80),
('Huevo Orgánico (15u)', 3.20, 50),
('Huevo de Codorniz (24u)', 2.50, 60),
('Huevo Azul (30u)', 5.00, 40),
('Cartón Vacío', 0.50, 200)
ON CONFLICT DO NOTHING;

-- Production extensions for branches, payment reporting, customer addresses and purchases
ALTER TABLE users ADD COLUMN IF NOT EXISTS branch_id INTEGER;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS branch_id INTEGER;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS payment_method VARCHAR(30) DEFAULT 'cash';

CREATE TABLE IF NOT EXISTS purchases (
  id SERIAL PRIMARY KEY,
  branch_id INTEGER NOT NULL,
  product_id INTEGER REFERENCES products(id),
  product_name VARCHAR(100) NOT NULL,
  supplier VARCHAR(120) NOT NULL,
  quantity INTEGER NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchases_branch_created_at ON purchases(branch_id, created_at);
CREATE INDEX IF NOT EXISTS idx_sales_branch_payment ON sales(branch_id, payment_method);
