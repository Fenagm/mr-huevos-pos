export const handler = async (event) => {
  const { userId, branchId, initialAmount } = JSON.parse(event.body || '{}')
  
  const session = {
    sessionId: Date.now(),
    userId,
    branchId,
    initialAmount,
    openedAt: new Date().toISOString(),
    status: 'open',
  }
  
  console.log('Session opened:', session)
  
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, ...session }),
  }
}
