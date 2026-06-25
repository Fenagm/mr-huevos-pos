export const handler = async (event) => {
  const { branchId } = event.queryStringParameters || {}
  
  // Demo products
  const products = [
    { productId: 1, name: 'Yerba Mate 1kg', price: 8500, stock: 50, branchId: branchId || 1 },
    { productId: 2, name: 'Azúcar 1kg', price: 6200, stock: 30, branchId: branchId || 1 },
    { productId: 3, name: 'Arroz 1kg', price: 7800, stock: 40, branchId: branchId || 1 },
    { productId: 4, name: 'Fideos 500g', price: 4500, stock: 60, branchId: branchId || 1 },
  ]
  
  console.log('Getting products:', { branchId })
  
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, products }),
  }
}
