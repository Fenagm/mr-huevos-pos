export const handler = async (event) => {
  const { deliveryId, vehicleId } = JSON.parse(event.body || '{}')

  // Devuelve el objeto completo de la entrega con los campos que el store necesita.
  // En producción: hacer SELECT de la fila actualizada en Supabase y devolverla completa.
  // En demo: el store ya tiene el objeto local, fusionamos solo los campos que cambian.
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      // El store hace: deliveries.value[index] = updatedDelivery
      // Así que devolvemos SOLO los campos delta; el store los mezcla en modo real.
      // IMPORTANTE: en producción reemplazar esto por la fila completa de Supabase.
      id: deliveryId,
      vehicle_id: vehicleId,
      status: 'assigned',
    }),
  }
}
