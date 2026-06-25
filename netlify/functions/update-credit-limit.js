export const handler = async (event) => {
  const { customerId, creditLimit } = JSON.parse(event.body || '{}')
  
  console.log('Credit limit updated:', { customerId, creditLimit })
  
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, customerId, creditLimit }),
  }
}
