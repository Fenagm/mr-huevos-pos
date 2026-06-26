export const handler = async (event) => {
  // En producción con Supabase:
  // 1. Validar JWT desde el header Authorization
  // 2. Consultar usuario desde la tabla users de Supabase
  // SELECT id, username, role, branch_id FROM users WHERE username = $1
  
  const { username, password } = JSON.parse(event.body || '{}')

  console.log('Login attempt:', { username })

  // Sin datos demo — en desarrollo local se puede usar autenticación básica
  // Para producción, conectar con Supabase Auth o base de datos de usuarios
  return {
    statusCode: 501,
    body: JSON.stringify({ 
      error: 'Backend no configurado. Conectar con Supabase para autenticación.',
      hint: 'Configurar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY'
    }),
  }
}
