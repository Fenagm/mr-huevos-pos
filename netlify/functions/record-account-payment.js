import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const { movement, newBalance, amount, paymentMethod } = JSON.parse(event.body || '{}')

    if (!movement || !movement.customerId || !movement.userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: 'Datos de pago inválidos o incompletos' })
      }
    }

    // 1. Insertar el movimiento en la cuenta corriente
    const { data: newMovement, error: movementError } = await supabase
      .from('account_movements')
      .insert([
        {
          customer_id: movement.customerId,
          user_id: movement.userId,
          type: 'payment',
          amount: amount,
          balance_after: newBalance,
          description: movement.description || 'Entrega de efectivo / Pago a cuenta',
          payment_method: paymentMethod
        }
      ])
      .select()
      .single()

    if (movementError) throw movementError

    // 2. Actualizar el saldo actual del cliente
    const { error: customerError } = await supabase
      .from('customers')
      .update({ account_balance: newBalance })
      .eq('id', movement.customerId)

    if (customerError) throw customerError

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, movement: newMovement })
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message })
    }
  }
}
