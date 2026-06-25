export const handler = async (event) => {
  const { customerId, type, amount, description } = JSON.parse(event.body || '{}')
  
  const movement = {
    movementId: Date.now(),
    customerId,
    type,
    amount,
    description,
    date: new Date().toISOString(),
  }
  
  console.log('Account movement added:', movement)
  
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, ...movement }),
  }
}
