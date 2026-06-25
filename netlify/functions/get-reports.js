export const handler = async (event) => {
  // Demo mode - in production, query from Supabase by branch/date and include payment_method.
  const mockSales = [
    { id: 1, date: '2024-01-15', itemsCount: 5, total: 45.50, paymentMethod: 'cash', user: 'admin' },
    { id: 2, date: '2024-01-15', itemsCount: 3, total: 28.00, paymentMethod: 'transfer', user: 'admin' },
    { id: 3, date: '2024-01-14', itemsCount: 10, total: 95.00, paymentMethod: 'card', user: 'admin' },
    { id: 4, date: '2024-01-14', itemsCount: 2, total: 38.00, paymentMethod: 'account', user: 'vendedor' },
  ]

  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      sales: mockSales,
      summary: {
        totalSales: mockSales.reduce((sum, sale) => sum + sale.total, 0).toFixed(2),
        transactions: mockSales.length,
        topProduct: 'Huevo Blanco (30u)',
      },
    }),
  }
}
