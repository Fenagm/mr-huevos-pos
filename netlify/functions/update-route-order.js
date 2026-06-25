export const handler = async (event) => {
  const { deliveryId, routeOrder } = JSON.parse(event.body || '{}')
  
  console.log('Route order updated:', { deliveryId, routeOrder })
  
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, deliveryId, route_order: routeOrder }),
  }
}
