export const handler = async (event) => {
  const { items, total, userId } = JSON.parse(event.body);

  // Demo mode - in production, save to Supabase
  console.log('Sale created:', { items, total, userId, date: new Date().toISOString() });

  return {
    statusCode: 200,
    body: JSON.stringify({ 
      success: true, 
      saleId: Date.now(),
      message: 'Venta registrada'
    }),
  };
};
