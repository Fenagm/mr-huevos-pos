export const handler = async (event) => {
  const {
    id,
    sale_id,
    customer_name,
    customer_address,
    customer_phone,
    delivery_date,
    total_bultos,
    notes = '',
  } = JSON.parse(event.body || '{}')

  const delivery = {
    id: id || Date.now(),
    sale_id,
    customer_name,
    customer_address,
    customer_phone,
    delivery_date,
    vehicle_id: null,
    route_order: null,
    status: 'pending',
    total_bultos,
    notes,
    created_at: new Date().toISOString(),
  }

  console.log('Delivery created:', delivery)

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, ...delivery }),
  }
}
