export const handler = async (event) => {
  const { branchId, startDate, endDate } = event.queryStringParameters || {}

  console.log('Getting sessions:', { branchId, startDate, endDate })

  // Campos alineados con lo que el store espera: id, initialCash, openedAt, status
  const sessions = [
    {
      id: Date.now() - 86400000,
      userId: 1,
      branchId: Number(branchId) || 1,
      initialCash: 100000,
      cashSales: 45000,
      cardSales: 20000,
      transferSales: 15000,
      accountReceivableSales: 10000,
      openedAt: startDate ? new Date(startDate).toISOString() : new Date(Date.now() - 86400000).toISOString(),
      closedAt: startDate ? new Date(startDate).toISOString() : new Date(Date.now() - 82800000).toISOString(),
      status: 'closed',
      difference: 0,
      notes: '',
    },
    {
      id: Date.now(),
      userId: 1,
      branchId: Number(branchId) || 1,
      initialCash: 150000,
      cashSales: 0,
      cardSales: 0,
      transferSales: 0,
      accountReceivableSales: 0,
      openedAt: new Date().toISOString(),
      closedAt: null,
      status: 'open',
      difference: null,
      notes: '',
    },
  ]

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, sessions }),
  }
}
