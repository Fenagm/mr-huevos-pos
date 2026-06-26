export const handler = async (event) => {
  const { sessionId } = event.queryStringParameters || {}

  console.log('Getting expenses:', { sessionId })

  // Campos alineados: id (no expenseId), sessionId, amount, description, category, date
  const expenses = [
    {
      id: 1,
      sessionId: Number(sessionId) || sessionId,
      amount: 5000,
      description: 'Bolsas',
      category: 'insumos',
      date: new Date().toISOString(),
      userId: 1,
    },
    {
      id: 2,
      sessionId: Number(sessionId) || sessionId,
      amount: 15000,
      description: 'Combustible',
      category: 'transporte',
      date: new Date().toISOString(),
      userId: 1,
    },
  ]

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, expenses }),
  }
}
