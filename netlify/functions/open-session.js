export const handler = async (event) => {
  const { userId, branchId, initialCash } = JSON.parse(event.body || '{}')
  
  const session = {
    id: Date.now(),
    userId,
    branchId,
    initialCash,
    openedAt: new Date().toISOString(),
    status: 'open',
    cashSales: 0,
    cardSales: 0,
    transferSales: 0,
    accountReceivableSales: 0,
  }
  
  console.log('Session opened:', session)
  
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, ...session }),
  }
}
