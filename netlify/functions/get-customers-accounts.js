export const handler = async (event) => {
  const customers = [
    { customerId: 1, name: 'Juan Pérez', balance: 50000, creditLimit: 100000 },
    { customerId: 2, name: 'María Gómez', balance: 25000, creditLimit: 75000 },
    { customerId: 3, name: 'Carlos Ruiz', balance: 0, creditLimit: 50000 },
  ]
  
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, customers }),
  }
}
