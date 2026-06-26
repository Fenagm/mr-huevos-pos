export const handler = async (event) => {
  const { startDate, endDate } = event.queryStringParameters || {}

  console.log('Getting spoilages:', { startDate, endDate })

  // Campos alineados con InventoryView: id (no spoilageId), productId, quantity, reason, createdAt
  const spoilages = [
    { id: 1, productId: 1, quantity: 2, reason: 'Vencido', notes: '', userId: 1, branchId: 1, createdAt: new Date().toISOString() },
    { id: 2, productId: 2, quantity: 5, reason: 'Dañado',  notes: '', userId: 1, branchId: 1, createdAt: new Date().toISOString() },
  ]

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, spoilages }),
  }
}
