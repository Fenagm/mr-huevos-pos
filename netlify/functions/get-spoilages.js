export const handler = async (event) => {
  const { startDate, endDate } = event.queryStringParameters || {}
  
  const spoilages = [
    { spoilageId: 1, productId: 1, quantity: 2, reason: 'Vencido', recordedAt: new Date().toISOString() },
    { spoilageId: 2, productId: 2, quantity: 5, reason: 'Dañado', recordedAt: new Date().toISOString() },
  ]
  
  console.log('Getting spoilages:', { startDate, endDate })
  
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, spoilages }),
  }
}
