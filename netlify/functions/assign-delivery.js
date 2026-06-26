export const handler = async (event) => {
  const { deliveryId, vehicleId } = JSON.parse(event.body || '{}')

  if (!deliveryId || !vehicleId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'deliveryId y vehicleId son requeridos' }),
    }
  }

  console.log('Assigning delivery:', { deliveryId, vehicleId })

  // En producción con Supabase:
  // UPDATE deliveries SET vehicle_id = vehicleId, status = 'assigned' WHERE id = deliveryId
  // RETURNING *

  // Sin backend conectado — devolver solo confirmación
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      id: deliveryId,
      vehicle_id: vehicleId,
      status: 'assigned',
    }),
  }
}
