export const handler = async (event) => {
  const { sessionId } = event.queryStringParameters || {}
  
  // Demo expenses
  const expenses = [
    { expenseId: 1, sessionId, amount: 5000, description: 'Bolsas', category: 'insumos', recordedAt: new Date().toISOString() },
    { expenseId: 2, sessionId, amount: 15000, description: 'Combustible', category: 'transporte', recordedAt: new Date().toISOString() },
  ]
  
  console.log('Getting expenses:', { sessionId })
  
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, expenses }),
  }
}
