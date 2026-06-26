export const handler = async (event) => {
  const { customerId, startDate, endDate } = event.queryStringParameters || {}

  if (!customerId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'customerId es requerido' }),
    }
  }

  // En producción con Supabase:
  // SELECT * FROM account_movements WHERE customer_id = customerId
  // AND date BETWEEN startDate AND endDate ORDER BY date DESC

  console.log('Getting customer movements:', { customerId, startDate, endDate })

  // Sin datos demo — devolver array vacío si no hay backend conectado
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, movements: [] }),
  }
}
