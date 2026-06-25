export const handler = async (event) => {
  const { customerId, amount, paymentMethod } = JSON.parse(event.body || '{}')
  
  const payment = {
    paymentId: Date.now(),
    customerId,
    amount,
    paymentMethod,
    date: new Date().toISOString(),
  }
  
  console.log('Account payment recorded:', payment)
  
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, ...payment }),
  }
}
