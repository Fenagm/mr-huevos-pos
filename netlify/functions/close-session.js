export const handler = async (event) => {
  const { sessionId, finalAmount } = JSON.parse(event.body || '{}')
  
  const session = {
    sessionId,
    finalAmount,
    closedAt: new Date().toISOString(),
    status: 'closed',
  }
  
  console.log('Session closed:', session)
  
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, ...session }),
  }
}
