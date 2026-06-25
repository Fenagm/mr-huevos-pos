export const handler = async (event) => {
  const { productId, name, price, stock, branchId } = JSON.parse(event.body || '{}')
  
  const product = {
    productId: productId || Date.now(),
    name,
    price,
    stock,
    branchId,
    savedAt: new Date().toISOString(),
  }
  
  console.log('Product saved:', product)
  
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, ...product }),
  }
}
