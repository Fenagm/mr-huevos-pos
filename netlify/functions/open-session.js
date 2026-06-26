import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const { userId, branchId, initialCash } = JSON.parse(event.body || '{}')

    if (!userId || !branchId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: 'Usuario y Sucursal son requeridos para abrir caja' })
      }
    }

    const { data: session, error } = await supabase
      .from('cash_register_sessions')
      .insert([
        {
          user_id: userId,
          branch_id: branchId,
          initial_cash: initialCash || 0,
          status: 'open'
        }
      ])
      .select()
      .single()

    if (error) throw error

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, ...session })
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message })
    }
  }
}
