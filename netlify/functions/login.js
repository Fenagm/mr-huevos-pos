export const handler = async (event) => {
  // TODO: In production, validate Authorization header with JWT verification
  // const authHeader = event.headers.Authorization
  // if (!authHeader || !validateToken(authHeader.replace('Bearer ', ''))) {
  //   return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) }
  // }
  
  const users = [
    { id: 1, username: 'admin', password: 'admin123', role: 'admin', branchId: 1, branchName: 'Centenario' },
    { id: 2, username: 'encargado', password: 'encargado123', role: 'manager', branchId: 1, branchName: 'Centenario' },
    { id: 3, username: 'vendedor', password: 'vendedor123', role: 'seller', branchId: 2, branchName: 'Caaguazú' },
  ]
  
  const { username, password } = JSON.parse(event.body || '{}')
  const user = users.find((u) => u.username === username && u.password === password)
  
  if (!user) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Credenciales inválidas' }) }
  }

  const { password: _password, ...safeUser } = user
  return {
    statusCode: 200,
    body: JSON.stringify({ user: safeUser, token: `demo-token-${safeUser.role}-${Date.now()}` }),
  }
}
