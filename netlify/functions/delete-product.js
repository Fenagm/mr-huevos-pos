export const handler = async (event) => {
  const { productId } = JSON.parse(event.body || '{}')
  
  console.log('Product deleted:', { productId })
  
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, productId }),
  }
}
