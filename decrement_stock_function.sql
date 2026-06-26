CREATE OR REPLACE FUNCTION decrement_stock(row_id UUID, quantity_to_sub INT)
RETURNS void AS $$
BEGIN
  UPDATE public.products
  SET stock = stock - quantity_to_sub
  WHERE id = row_id;
END;
$$ LANGUAGE plpgsql;
