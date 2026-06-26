export const handler = async (event) => {
  console.log('Getting spoilages')

  // En producción con Supabase:
  // SELECT * FROM spoilages ORDER BY created_at DESC

  // Sin datos demo — devolver array vacío si no hay backend conectado
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, spoilages: [] }),
  }
}
