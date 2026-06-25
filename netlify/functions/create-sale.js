export const handler = async (event) => {
  const {
    items = [],
    total = 0,
    userId,
    branchId,
    paymentMethod,
    customerId = null,
    isForDelivery = false,
  } = JSON.parse(event.body || '{}')

  const sale = {
    saleId: Date.now(),
    items,
    total,
    userId,
    branchId,
    paymentMethod,
    customerId,
    isForDelivery,
    date: new Date().toISOString(),
  }

  // Demo mode - in production, save to Supabase enforcing branch_id in every table.
  console.log('Sale created:', sale)

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, ...sale, message: 'Venta registrada' }),
  }
}
