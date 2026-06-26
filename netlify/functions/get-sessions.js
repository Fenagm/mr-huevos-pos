export const handler = async (event) => {
  const { branchId, startDate, endDate } = event.queryStringParameters || {}

  console.log('Getting sessions:', { branchId, startDate, endDate })

  // En producción con Supabase:
  // SELECT * FROM cash_register_sessions WHERE branch_id = branchId
  // AND opened_at BETWEEN startDate AND endDate ORDER BY opened_at DESC

  // Sin datos demo — devolver array vacío si no hay backend conectado
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, sessions: [] }),
  }
}
