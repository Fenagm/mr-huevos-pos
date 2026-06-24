export const handler = async (event) => {
  // Demo mode - in production, query from Supabase
  const mockSales = [
    { id: 1, date: '2024-01-15', itemsCount: 5, total: 45.50, user: 'admin' },
    { id: 2, date: '2024-01-15', itemsCount: 3, total: 28.00, user: 'admin' },
    { id: 3, date: '2024-01-14', itemsCount: 10, total: 95.00, user: 'admin' },
  ];

  return {
    statusCode: 200,
    body: JSON.stringify({
      sales: mockSales,
      summary: {
        totalSales: '168.50',
        transactions: 3,
        topProduct: 'Huevo Blanco (30u)',
      },
    }),
  };
};
