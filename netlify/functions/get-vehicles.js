export const handler = async (event) => {
  console.log('Getting vehicles')

  // En producción con Supabase:
  // SELECT * FROM vehicles ORDER BY name ASC

  // Sin datos demo — devolver array vacío si no hay backend conectado
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, vehicles: [] }),
  }
}
