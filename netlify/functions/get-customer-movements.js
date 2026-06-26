export const handler = async (event) => {
  const { customerId, startDate, endDate } = event.queryStringParameters || {}

  // customerId llega como string desde el query param — convertir a número para comparar
  const customerIdNum = Number(customerId)

  // Filtrado por fecha real
  const allMovements = [
    { id: 1, customerId: 1, type: 'sale',    amount: 25000,  balanceAfter: 25000,  date: '2024-01-10', description: 'Venta al crédito',   userId: 1 },
    { id: 2, customerId: 1, type: 'payment', amount: -15000, balanceAfter: 10000,  date: '2024-01-12', description: 'Pago en efectivo',   userId: 1 },
    { id: 3, customerId: 1, type: 'sale',    amount: 40000,  balanceAfter: 50000,  date: '2024-01-15', description: 'Venta al crédito',   userId: 1 },
    { id: 4, customerId: 2, type: 'sale',    amount: 25000,  balanceAfter: 25000,  date: '2024-01-14', description: 'Venta al crédito',   userId: 1 },
    { id: 5, customerId: 3, type: 'sale',    amount: 95000,  balanceAfter: 95000,  date: '2024-01-13', description: 'Venta al crédito',   userId: 1 },
  ]

  const movements = allMovements.filter(m => {
    if (m.customerId !== customerIdNum) return false
    if (startDate && m.date < startDate) return false
    if (endDate && m.date > endDate) return false
    return true
  })

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, movements }),
  }
}
