export const handler = async (event) => {
  const { sessionId, items, total, paymentMethod } = JSON.parse(event.body || '{}')
  
  const sale = {
    saleId: Date.now(),
    sessionId,
    items,
    total,
    paymentMethod,
    recordedAt: new Date().toISOString(),
  }
  
  console.log('Sale recorded:', sale)
  
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, ...sale }),
  }
}
