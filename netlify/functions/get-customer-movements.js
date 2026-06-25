export const handler = async (event) => {
  const { customerId, startDate, endDate } = event.queryStringParameters || {}
  
  const movements = [
    { movementId: 1, customerId, type: 'sale', amount: 25000, date: new Date().toISOString(), description: 'Venta al crédito' },
    { movementId: 2, customerId, type: 'payment', amount: -15000, date: new Date().toISOString(), description: 'Pago en efectivo' },
  ]
  
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, movements }),
  }
}
