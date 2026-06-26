import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }

  try {
    const { sessionId, userId, branchId, amount, description, category } = JSON.parse(event.body || '{}')

    if (!amount || !userId || !branchId) {
      return { statusCode: 400, body: JSON.stringify({ success: false, error: 'Monto, usuario y sucursal requeridos.' }) }
    }

    const { data: expense, error } = await supabase
      .from('expenses')
      .insert([{
        session_id: sessionId || null,
        user_id: userId,
        branch_id: branchId,
        amount: parseFloat(amount),
        description: description || '',
        category: category || 'otros'
      }])
      .select().single()

    if (error) throw error

    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ success: true, expense }) }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ success: false, error: err.message }) }
  }
}
