export const handler = async (event) => {
  const { productId, quantity, reason } = JSON.parse(event.body || '{}')
  
  const spoilage = {
    spoilageId: Date.now(),
    productId,
    quantity,
    reason,
    recordedAt: new Date().toISOString(),
  }
  
  console.log('Spoilage registered:', spoilage)
  
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, ...spoilage }),
  }
}
