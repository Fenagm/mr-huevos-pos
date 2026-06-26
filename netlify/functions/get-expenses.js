export const handler = async (event) => {
  const { sessionId } = event.queryStringParameters || {}

  console.log('Getting expenses:', { sessionId })

  // En producción con Supabase:
  // SELECT * FROM expenses WHERE session_id = sessionId ORDER BY date DESC

  // Sin datos demo — devolver array vacío si no hay backend conectado
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, expenses: [] }),
  }
}
