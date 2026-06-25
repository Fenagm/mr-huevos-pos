export const handler = async (event) => {
  const { customerId, address, items, total, phone } = JSON.parse(event.body || '{}')
  
  const delivery = {
    deliveryId: Date.now(),
    customerId,
    address,
    items,
    total,
    phone,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
  
  console.log('Delivery created:', delivery)
  
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, ...delivery }),
  }
}
