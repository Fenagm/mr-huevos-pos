export const handler = async (event) => {
  const { deliveryId } = JSON.parse(event.body || '{}')
  
  console.log('Delivery unassigned:', { deliveryId })
  
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, deliveryId }),
  }
}
