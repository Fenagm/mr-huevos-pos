export const handler = async (event) => {
  const {
    id,
    name,
    retailPrice,
    wholesalePrice,
    costPrice,
    stock,
    active,
    branchId,
  } = JSON.parse(event.body || '{}')

  const product = {
    id: id || Date.now(),
    name,
    retailPrice,
    wholesalePrice,
    costPrice,
    stock,
    active: active ?? true,
    branchId,
    savedAt: new Date().toISOString(),
  }

  console.log('Product saved:', product)

  // En producción con Supabase:
  // si hay id → UPDATE products SET ... WHERE id = id AND branch_id = branchId
  // si no hay id → INSERT INTO products (...)

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, ...product }),
  }
}
