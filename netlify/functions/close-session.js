export const handler = async (event) => {
  const { sessionId, finalCash, notes, difference } = JSON.parse(event.body || '{}')
  
  const session = {
    id: sessionId,
    finalCash,
    notes,
    difference,
    closedAt: new Date().toISOString(),
    status: difference === 0 ? 'closed' : (difference < 0 ? 'closed_missing' : 'closed_extra'),
  }
  
  console.log('Session closed:', session)
  
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, ...session }),
  }
}
