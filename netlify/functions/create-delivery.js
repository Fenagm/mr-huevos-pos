import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }

  try {
    const d = JSON.parse(event.body || '{}')

    const { data: delivery, error } = await supabase
      .from('deliveries')
      .insert([{
        sale_id: d.saleId || null,
        vehicle_id: d.vehicleId || null,
        customer_name: d.customerName,
        customer_address: d.customerAddress,
        customer_phone: d.customerPhone || null,
        delivery_date: d.deliveryDate || null,
        total_bultos: d.totalBultos || 1,
        status: 'pending',
        notes: d.notes || ''
      }])
      .select().single()

    if (error) throw error

    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ success: true, delivery }) }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ success: false, error: err.message }) }
  }
}
