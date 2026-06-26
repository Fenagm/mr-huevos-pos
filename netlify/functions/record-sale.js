import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const { sale } = JSON.parse(event.body || '{}')

    if (!sale || !sale.userId || !sale.branchId || !sale.items) {
      return { statusCode: 400, body: JSON.stringify({ success: false, error: 'Datos de venta incompletos.' }) }
    }

    // 1. Insertar cabecera de venta
    const { data: newSale, error: saleError } = await supabase
      .from('sales')
      .insert([{
        session_id: sale.sessionId || null,
        user_id: sale.userId,
        branch_id: sale.branchId,
        customer_id: sale.customerId || null,
        total_amount: sale.total,
        payment_method: sale.paymentMethod || 'cash'
      }])
      .select().single()

    if (saleError) throw saleError

    // 2. Insertar ítems
    const itemsToInsert = sale.items.map(item => ({
      sale_id: newSale.id,
      product_id: item.id,
      quantity: item.quantity,
      unit_price: item.price,
      subtotal: item.quantity * item.price
    }))

    const { error: itemsError } = await supabase.from('sale_items').insert(itemsToInsert)
    if (itemsError) throw itemsError

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, sale: newSale })
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ success: false, error: err.message }) }
  }
}
