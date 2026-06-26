import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

const VALID_STATUSES = ['pending', 'assigned', 'in-transit', 'delivered']

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const { deliveryId, status } = JSON.parse(event.body || '{}')

    if (!deliveryId || !status) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: 'ID de entrega y estado son requeridos.' })
      }
    }

    if (!VALID_STATUSES.includes(status)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: `Estado inválido. Valores permitidos: ${VALID_STATUSES.join(', ')}` })
      }
    }

    const { data: delivery, error } = await supabase
      .from('deliveries')
      .update({ status })
      .eq('id', deliveryId)
      .select()
      .single()

    if (error) throw error

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, delivery })
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message })
    }
  }
}
