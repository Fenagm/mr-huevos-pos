export const handler = async (event) => {
  const { deliveryId, routeOrder } = JSON.parse(event.body || '{}')

  console.log('Route order updated:', { deliveryId, routeOrder })

  // Devuelve solo el delta; el store hace merge con el objeto local
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, id: deliveryId, route_order: routeOrder }),
  }
}
