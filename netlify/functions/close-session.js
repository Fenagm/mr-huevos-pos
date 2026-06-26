import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const { sessionId, finalCash, notes, difference } = JSON.parse(event.body || '{}')

    if (!sessionId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: 'El ID de sesión es requerido.' })
      }
    }

    // Nota: Tu base de datos restringe el estado estrictamente a 'open' o 'closed'.
    // Si hay faltante o sobrante, se guarda como 'closed' y la diferencia se detalla en las notas.
    const customNotes = difference !== 0 
      ? `${notes || ''} (Diferencia de arqueo: ${difference >= 0 ? '+' : ''}${difference})`.trim()
      : notes

    const { data: session, error } = await supabase
      .from('cash_register_sessions')
      .update({
        final_cash: finalCash,
        status: 'closed',
        closed_at: new Date().toISOString(),
        notes: customNotes
      })
      .eq('id', sessionId)
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
