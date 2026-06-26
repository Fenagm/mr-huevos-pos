export const handler = async (event) => {
  const { sessionId, amount, description, category, userId, date } = JSON.parse(event.body || '{}')

  const expense = {
    id: Date.now(),   // 'id' en lugar de 'expenseId' — alineado con el store
    sessionId,
    amount,
    description,
    category: category || 'Otros',
    date: date || new Date().toISOString(),
    userId,
  }

  console.log('Expense added:', expense)

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, ...expense }),
  }
}
