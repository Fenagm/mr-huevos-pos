export const handler = async (event) => {
  const { branchId, startDate, endDate } = event.queryStringParameters || {}

  console.log('Getting reports:', { branchId, startDate, endDate })

  // En producción con Supabase:
  // SELECT * FROM sales WHERE branch_id = branchId AND created_at BETWEEN startDate AND endDate

  // Sin datos demo — devolver array vacío si no hay backend conectado
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      sales: [],
      summary: {
        totalSales: '0.00',
        transactions: 0,
        topProduct: '-',
      },
    }),
  }
}
