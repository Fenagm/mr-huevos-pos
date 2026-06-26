export const handler = async (event) => {
  const { branchId, startDate, endDate } = event.queryStringParameters || {}

  console.log('Getting reports:', { branchId, startDate, endDate })

  // En producción con Supabase:
  // SELECT * FROM sales WHERE branch_id = branchId AND created_at BETWEEN startDate AND endDate
  // Ahora filtramos por fecha en el demo para que el comportamiento sea consistente

  const allSales = [
    { id: 1, date: '2024-01-15', itemsCount: 5,  total: 45500,  paymentMethod: 'cash',     branchId: 1, user: 'admin' },
    { id: 2, date: '2024-01-15', itemsCount: 3,  total: 28000,  paymentMethod: 'transfer', branchId: 1, user: 'admin' },
    { id: 3, date: '2024-01-14', itemsCount: 10, total: 95000,  paymentMethod: 'card',     branchId: 1, user: 'admin' },
    { id: 4, date: '2024-01-14', itemsCount: 2,  total: 38000,  paymentMethod: 'account',  branchId: 2, user: 'vendedor' },
  ]

  const sales = allSales.filter(s => {
    if (branchId && s.branchId !== Number(branchId)) return false
    if (startDate && s.date < startDate) return false
    if (endDate && s.date > endDate) return false
    return true
  })

  const totalSales = sales.reduce((sum, s) => sum + s.total, 0)

  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      sales,
      summary: {
        totalSales: totalSales.toFixed(2),
        transactions: sales.length,
        topProduct: 'Huevo Blanco (30u)',
      },
    }),
  }
}
