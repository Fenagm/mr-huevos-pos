import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const productData = JSON.parse(event.body || '{}')
    
    if (!productData.name) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: 'El nombre del producto es obligatorio.' })
      }
    }

    // Preparar payload mapeando a snake_case según tu esquema SQL
    const payload = {
      name: productData.name,
      cost_price: productData.costPrice ? parseFloat(productData.costPrice) : null,
      retail_price: productData.retailPrice ? parseFloat(productData.retailPrice) : null,
      wholesale_price: productData.wholesalePrice ? parseFloat(productData.wholesalePrice) : null,
      stock: productData.stock ? parseInt(productData.stock, 10) : 0,
      active: productData.active !== undefined ? productData.active : true,
      branch_id: productData.branchId || null
    }

    // Si viene un ID válido, se incluye para actualizar; si no, se deja nulo para que PostgreSQL genere el UUID
    if (productData.id) {
      payload.id = productData.id
    }

    const { data: product, error } = await supabase
      .from('products')
      .upsert(payload)
      .select()
      .single()

    if (error) throw error

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, product })
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message })
    }
  }
}
