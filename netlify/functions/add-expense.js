export const handler = async (event) => {
  const { sessionId, amount, description, category } = JSON.parse(event.body || '{}')
  
  const expense = {
    expenseId: Date.now(),
    sessionId,
    amount,
    description,
    category,
    recordedAt: new Date().toISOString(),
  }
  
  console.log('Expense added:', expense)
  
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, ...expense }),
  }
}
