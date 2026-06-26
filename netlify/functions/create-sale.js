export const handler = async (event) => {
  const {
    items = [],
    total = 0,
    userId,
    branchId,
    paymentMethod,
    customerId = null,
    isForDelivery = false,
  } = JSON.parse(event.body || '{}')

  console.log('Creating sale:', { items: items.length, total, paymentMethod })

  // En producción con Supabase:
  // 1. INSERT INTO sales (...) VALUES (...) RETURNING id
  // 2. INSERT INTO sale_items (sale_id, product_id, quantity, price) VALUES ...
  // 3. UPDATE products SET stock = stock - quantity WHERE id = product_id
  // 4. Si es cuenta corriente: UPDATE customers SET account_balance = account_balance + total

  // Sin backend conectado — devolver solo confirmación
  return {
    statusCode: 200,
    body: JSON.stringify({ 
      success: true, 
      saleId: Date.now(),
      message: 'Venta registrada' 
    }),
  }
}
