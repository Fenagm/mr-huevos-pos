export const handler = async (event) => {
  const { branchId } = event.queryStringParameters || {}

  console.log('Getting products:', { branchId })

  // En producción con Supabase:
  // SELECT * FROM products WHERE branch_id = branchId AND active = true ORDER BY name ASC

  // Sin datos demo — devolver array vacío si no hay backend conectado
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, products: [] }),
  }
}
