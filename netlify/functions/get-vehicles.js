export const handler = async (event) => {
  const vehicles = [
    { vehicleId: 1, name: 'Motocicleta 1', plate: 'ABC-123', status: 'available', driverId: 1 },
    { vehicleId: 2, name: 'Motocicleta 2', plate: 'DEF-456', status: 'on-delivery', driverId: 2 },
    { vehicleId: 3, name: 'Furgoneta', plate: 'GHI-789', status: 'available', driverId: 3 },
  ]
  
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, vehicles }),
  }
}
