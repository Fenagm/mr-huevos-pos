import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const {
      items = [],
      total = 0,
      userId,
      branchId,
      paymentMethod,
      customerId = null,
      sessionId = null
    } = JSON.parse(event.body || '{}')

    if (!items.length || !userId || !branchId || !paymentMethod) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: 'Datos de la venta incompletos.' })
      }
    }

    // 1. Insertar la cabecera de la venta
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert([
        {
          session_id: sessionId,
          user_id: userId,
          branch_id: branchId,
          customer_id: customerId,
          total_amount: total,
          payment_method: paymentMethod
        }
      ])
      .select()
      .single()

    if (saleError) throw saleError

    // 2. Insertar los ítems de la venta y actualizar stock
    for (const item of items) {
      const { error: itemError } = await supabase
        .from('sale_items')
        .insert([
          {
            sale_id: sale.id,
            product_id: item.id,
            quantity: item.quantity,
            unit_price: item.price,
            subtotal: item.quantity * item.price
          }
        ])

      if (itemError) throw itemError

      // Descontar el stock usando RPC
      const { error: stockError } = await supabase.rpc('decrement_stock', {
        row_id: item.id,
        quantity_to_sub: item.quantity
      })
      
      if (stockError) {
        // Fallback a update tradicional si RPC no existe
        const { data: product } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.id)
          .single()
        
        if (product) {
          await supabase.from('products')
            .update({ stock: product.stock - item.quantity })
            .eq('id', item.id)
        }
      }
    }

    // 3. Si el pago es en cuenta corriente, actualizamos el saldo del cliente
    if (paymentMethod === 'account' && customerId) {
      const { data: customer } = await supabase
        .from('customers')
        .select('account_balance')
        .eq('id', customerId)
        .single()

      const newBalance = Number(customer?.account_balance || 0) + Number(total)

      const { error: customerError } = await supabase
        .from('customers')
        .update({ account_balance: newBalance })
        .eq('id', customerId)

      if (customerError) throw customerError

      // Registramos el movimiento de cuenta corriente
      await supabase.from('account_movements').insert([
        {
          customer_id: customerId,
          user_id: userId,
          type: 'sale',
          amount: total,
          balance_after: newBalance,
          description: `Venta registrada N° ${sale.id}`
        }
      ])
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        saleId: sale.id,
        message: 'Venta registrada con éxito en Supabase'
      })
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message })
    }
  }
}
