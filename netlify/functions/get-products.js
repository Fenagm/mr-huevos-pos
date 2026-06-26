import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

export const handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const { branchId } = event.queryStringParameters || {}

    let query = supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('name', { ascending: true })

    if (branchId) {
      query = query.eq('branch_id', branchId)
    }

    const { data: products, error } = await query

    if (error) throw error

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(products)
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message })
    }
  }
}
