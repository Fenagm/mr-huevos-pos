import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }

  try {
    const { deliveryId, vehicleId, routeOrder } = JSON.parse(event.body || '{}')

    const { data: delivery, error } = await supabase
      .from('deliveries')
      .update({
        vehicle_id: vehicleId,
        route_order: routeOrder || null,
        status: 'assigned'
      })
      .eq('id', deliveryId)
      .select().single()

    if (error) throw error

    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ success: true, delivery }) }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ success: false, error: err.message }) }
  }
}
