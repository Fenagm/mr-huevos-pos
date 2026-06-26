export const handler = async (event) => {
  // El store manda { movement, newBalance }
  // movement contiene: { id, customerId, type, amount, balanceAfter, date, description, userId }
  const { movement, newBalance } = JSON.parse(event.body || '{}')

  if (!movement || !movement.customerId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Datos de movimiento inválidos' }),
    }
  }

  console.log('Account movement added:', { movement, newBalance })

  // En producción con Supabase:
  // 1. INSERT en account_movements con todos los campos de movement
  // 2. UPDATE customers SET account_balance = newBalance WHERE id = movement.customerId

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, movement }),
  }
}
