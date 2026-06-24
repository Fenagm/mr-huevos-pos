export const handler = async (event) => {
  const { username, password } = JSON.parse(event.body);

  // Demo authentication - in production, verify against Supabase
  if (username === 'admin') {
    return {
      statusCode: 200,
      body: JSON.stringify({
        user: { id: 1, username: 'admin', role: 'admin' },
        token: 'demo-token-' + Date.now(),
      }),
    };
  }

  return {
    statusCode: 401,
    body: JSON.stringify({ error: 'Credenciales inválidas' }),
  };
};
