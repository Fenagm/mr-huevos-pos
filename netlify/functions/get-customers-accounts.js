export const handler = async (event) => {
  // Demo customers with fields matching what the store expects: id, accountBalance, creditLimit, active
  const customers = [
    { id: 1, name: 'Juan Pérez', accountBalance: 50000, creditLimit: 100000, active: true },
    { id: 2, name: 'María Gómez', accountBalance: 25000, creditLimit: 75000, active: true },
    { id: 3, name: 'Carlos Ruiz', accountBalance: 0, creditLimit: 50000, active: true },
  ]
  
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, customers }),
  }
}
