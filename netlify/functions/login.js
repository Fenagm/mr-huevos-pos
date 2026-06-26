import { createClient } from '@supabase/supabase-js'

export const handler = async (event) => {
  // En producción con Supabase:
  // 1. Validar JWT desde el header Authorization
  // 2. Consultar usuario desde la tabla users de Supabase
  // SELECT id, username, role, branch_id FROM users WHERE username = $1

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('[login] Missing Supabase credentials in environment variables')
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false, 
        error: 'Configuración del servidor incompleta. Contacte al administrador.' 
      }),
    }
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  const { username, password } = JSON.parse(event.body || '{}')

  if (!username || !password) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, error: 'Usuario y contraseña requeridos' }),
    }
  }

  try {
    // Buscar usuario en la tabla 'users' por username
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, role, branch_id, name')
      .eq('username', username)
      .single()

    if (error || !user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ success: false, error: 'Credenciales inválidas' }),
      }
    }

    // NOTA: En producción, deberías verificar la contraseña con bcrypt o usar Supabase Auth
    // Por ahora, si el usuario existe, permitimos el login (solo para desarrollo)
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          branchId: user.branch_id,
          name: user.name
        }
      }),
    }
  } catch (err) {
    console.error('[login] Error:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: 'Error interno del servidor' }),
    }
  }
}
