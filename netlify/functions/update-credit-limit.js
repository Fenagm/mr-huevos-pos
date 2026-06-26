import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const { customerId, newLimit } = JSON.parse(event.body || '{}')

    if (!customerId || newLimit === undefined) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: 'ID de cliente y nuevo límite son requeridos.' })
      }
    }

    const { data: customer, error } = await supabase
      .from('customers')
      .update({ credit_limit: parseFloat(newLimit) })
      .eq('id', customerId)
      .select()
      .single()

    if (error) throw error

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, customer })
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message })
    }
  }
}
