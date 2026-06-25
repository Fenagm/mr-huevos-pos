export const handler = async (event) => {
  const { deliveryId, vehicleId, driverId } = JSON.parse(event.body || '{}')
  
  console.log('Delivery assigned:', { deliveryId, vehicleId, driverId })
  
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, deliveryId, vehicleId, driverId }),
  }
}
