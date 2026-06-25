export const handler = async (event) => {
  const { deliveryId, status } = JSON.parse(event.body || '{}')
  
  console.log('Delivery status updated:', { deliveryId, status })
  
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, deliveryId, status }),
  }
}
