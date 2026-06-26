import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

export const handler = async (event) => {
  if (event.httpMethod !== 'GET') return { statusCode: 405, body: 'Method Not Allowed' }

  try {
    const { branchId } = event.queryStringParameters || {}

    // 1. Obtener ventas del mes/sucursal
    let salesQuery = supabase.from('sales').select('total_amount, payment_method, created_at')
    if (branchId) salesQuery = salesQuery.eq('branch_id', branchId)
    const { data: sales, error: salesError } = await salesQuery
    if (salesError) throw salesError

    // 2. Obtener gastos del mes/sucursal
    let expensesQuery = supabase.from('expenses').select('amount')
    if (branchId) expensesQuery = expensesQuery.eq('branch_id', branchId)
    const { data: expenses, error: expensesError } = await expensesQuery
    if (expensesError) throw expensesError

    // Calc de totales básicos
    const totalSales = sales.reduce((acc, curr) => acc + Number(curr.total_amount), 0)
    const totalExpenses = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0)
    const netProfit = totalSales - totalExpenses

    // Métodos de pago desglosados
    const paymentMethods = sales.reduce((acc, curr) => {
      acc[curr.payment_method] = (acc[curr.payment_method] || 0) + Number(curr.total_amount)
      return acc
    }, {})

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        summary: {
          totalSales,
          totalExpenses,
          netProfit,
          salesCount: sales.length
        },
        paymentMethods
      })
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ success: false, error: err.message }) }
  }
}
