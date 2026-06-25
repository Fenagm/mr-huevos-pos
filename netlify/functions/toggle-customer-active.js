export const handler = async (event) => {
  const { customerId, active } = JSON.parse(event.body || '{}')
  
  console.log('Customer status toggled:', { customerId, active })
  
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, customerId, active }),
  }
}
