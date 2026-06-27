import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

export const handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select('id, name, license_plate, capacity, active')
      .eq('active', true)
      .order('name', { ascending: true })

    if (error) throw error

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, vehicles: vehicles || [] }),
    }
  } catch (err) {
    console.error('[get-vehicles] Error:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message }),
    }
  }
}
