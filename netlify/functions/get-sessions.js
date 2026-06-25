export const handler = async (event) => {
  const { branchId, startDate, endDate } = event.queryStringParameters || {}
  
  // Demo sessions
  const sessions = [
    {
      sessionId: Date.now() - 86400000,
      userId: 1,
      branchId: branchId || 1,
      initialAmount: 100000,
      openedAt: startDate || new Date().toISOString(),
      status: 'closed',
    },
    {
      sessionId: Date.now(),
      userId: 1,
      branchId: branchId || 1,
      initialAmount: 150000,
      openedAt: new Date().toISOString(),
      status: 'open',
    },
  ]
  
  console.log('Getting sessions:', { branchId, startDate, endDate })
  
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, sessions }),
  }
}
