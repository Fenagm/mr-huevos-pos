import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs' // Importación estática obligatoria para Serverless

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  // Usar variables estándar de Backend (SIN el prefijo VITE_)
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('[login] Missing Supabase credentials in environment variables')
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false, 
        error: 'Configuración del servidor incompleta. Faltan variables de entorno.' 
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
    // Buscar usuario e incluir JOIN con branches para el nombre de la sucursal
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, role, branch_id, name, password_hash, branches(name)')
      .eq('username', username)
      .single()

    if (error || !user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ success: false, error: 'Credenciales inválidas: El usuario no existe.' }),
      }
    }

    // Verificar contraseña con el método seguro
    const passwordsMatch = await verifyPassword(password, user.password_hash)
    
    if (!passwordsMatch) {
      return {
        statusCode: 401,
        body: JSON.stringify({ success: false, error: 'Credenciales inválidas: Contraseña incorrecta.' }),
      }
    }
    
    // Retornar la estructura exacta que espera tu auth.js store
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        success: true, 
        token: `session_${user.id}_${Date.now()}`,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          branchId: user.branch_id,
          branchName: user.branches ? user.branches.name : 'Sin Sucursal',
          name: user.name
        }
      }),
    }
  } catch (err) {
    console.error('[login] Error:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: `Error interno: ${err.message}` }),
    }
  }
}

// Función limpia para verificar la contraseña usando bcrypt formalmente
async function verifyPassword(password, hash) {
  if (!hash || !password) return false

  // Soporte tanto para clave encriptada como para texto plano en modo desarrollo
  if (hash.startsWith('$2a$') || hash.startsWith('$2b$')) {
    return await bcrypt.compare(password, hash)
  }
  
  return password === hash
}
