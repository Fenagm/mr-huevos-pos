export const handler = async (event) => {
  const { customerId, isActive } = JSON.parse(event.body || '{}')
  
  console.log('Customer status toggled:', { customerId, isActive })
  
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, customerId, isActive }),
  }
}
