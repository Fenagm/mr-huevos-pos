import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

export const handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const { date } = event.queryStringParameters || {}

    if (!date) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: 'El parámetro date es requerido.' }),
      }
    }

    const { data: deliveries, error } = await supabase
      .from('deliveries')
      .select(`
        id,
        sale_id,
        customer_name,
        customer_address,
        customer_phone,
        delivery_date,
        vehicle_id,
        route_order,
        status,
        total_bultos,
        notes
      `)
      .eq('delivery_date', date)
      .order('route_order', { ascending: true, nullsFirst: false })

    if (error) throw error

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, deliveries: deliveries || [] }),
    }
  } catch (err) {
    console.error('[get-deliveries] Error:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message }),
    }
  }
}
