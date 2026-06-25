export const handler = async (event) => {
  const { productId, quantity, operation } = JSON.parse(event.body || '{}')
  
  console.log('Stock updated:', { productId, quantity, operation })
  
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, productId, quantity, operation }),
  }
}
