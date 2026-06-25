export const handler = async (event) => {
  const { deliveryId, order } = JSON.parse(event.body || '{}')
  
  console.log('Route order updated:', { deliveryId, order })
  
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, deliveryId, order }),
  }
}
