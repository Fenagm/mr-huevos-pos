export const handler = async (event) => {
  const { deliveryId, status } = JSON.parse(event.body || '{}')

  console.log('Delivery status updated:', { deliveryId, status })

  // Devuelve solo el delta; el store hace merge con el objeto local
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, id: deliveryId, status }),
  }
}
