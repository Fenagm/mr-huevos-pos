import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const { productId, newStock } = JSON.parse(event.body || '{}')

    if (!productId || newStock === undefined) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: 'ID de producto y nuevo stock son requeridos.' })
      }
    }

    const { data: product, error } = await supabase
      .from('products')
      .update({ stock: parseInt(newStock, 10) })
      .eq('id', productId)
      .select()
      .single()

    if (error) throw error

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, product })
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message })
    }
  }
}
