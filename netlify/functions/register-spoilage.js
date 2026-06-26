import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const { productId, quantity, reason, notes, userId, branchId } = JSON.parse(event.body || '{}')

    if (!productId || !quantity || !userId || !branchId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: 'Faltan parámetros obligatorios.' })
      }
    }

    // 1. Insertar el registro de merma
    const { data: spoilage, error: spoilageError } = await supabase
      .from('spoilages')
      .insert([
        {
          product_id: productId,
          user_id: userId,
          branch_id: branchId,
          quantity: quantity,
          reason: reason,
          notes: notes || ''
        }
      ])
      .select()
      .single()

    if (spoilageError) throw spoilageError

    // 2. Obtener el stock actual del producto y descontar la merma
    const { data: product } = await supabase
      .from('products')
      .select('stock')
      .eq('id', productId)
      .single()

    const { error: stockError } = await supabase
      .from('products')
      .update({ stock: (product?.stock || 0) - quantity })
      .eq('id', productId)

    if (stockError) throw stockError

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, ...spoilage })
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message })
    }
  }
}
