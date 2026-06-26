export const handler = async (event) => {
  const { deliveryId } = JSON.parse(event.body || '{}')

  console.log('Delivery unassigned:', { deliveryId })

  // Devuelve solo el delta; el store hace merge con el objeto local
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, id: deliveryId, vehicle_id: null, status: 'pending', route_order: null }),
  }
}
