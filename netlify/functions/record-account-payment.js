export const handler = async (event) => {
  // El store manda { movement, newBalance, amount, paymentMethod }
  // movement contiene: { id, customerId, type: 'payment', amount, balanceAfter, date, description, userId, paymentMethod }
  const { movement, newBalance, amount, paymentMethod } = JSON.parse(event.body || '{}')

  if (!movement || !movement.customerId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Datos de pago inválidos' }),
    }
  }

  console.log('Account payment recorded:', { movement, newBalance })

  // En producción con Supabase:
  // 1. INSERT en account_movements con todos los campos de movement
  // 2. UPDATE customers SET account_balance = newBalance WHERE id = movement.customerId

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, movement }),
  }
}
