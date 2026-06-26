export const handler = async (event) => {
  console.log('Getting customers accounts')

  // En producción con Supabase:
  // SELECT id, name, account_balance, credit_limit, active FROM customers ORDER BY name ASC

  // Sin datos demo — devolver array vacío si no hay backend conectado
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, customers: [] }),
  }
}
