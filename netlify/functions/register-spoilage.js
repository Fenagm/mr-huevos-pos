export const handler = async (event) => {
  const { productId, quantity, reason, notes, userId, branchId } = JSON.parse(event.body || '{}')

  const spoilage = {
    id: Date.now(),
    productId,
    quantity,
    reason,
    notes: notes || '',
    userId,
    branchId,
    createdAt: new Date().toISOString(),
  }

  console.log('Spoilage registered:', spoilage)

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, ...spoilage }),
  }
}
