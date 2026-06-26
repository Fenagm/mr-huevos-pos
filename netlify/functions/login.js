import { createClient } from '@supabase/supabase-js'

export const handler = async (event) => {
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
    // La tabla debe tener: id, username, password_hash, role, branch_id, name
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, role, branch_id, name, password_hash')
      .eq('username', username)
      .single()

    if (error || !user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ success: false, error: 'Credenciales inválidas' }),
      }
    }

    // Verificar contraseña
    // En producción: usar bcrypt.compare(password, user.password_hash)
    // Para desarrollo sin bcrypt: comparar directamente (SOLO PARA TESTING)
    // IMPORTANTE: La columna password_hash en Supabase debe contener el hash generado con bcrypt
    
    const passwordsMatch = await verifyPassword(password, user.password_hash)
    
    if (!passwordsMatch) {
      return {
        statusCode: 401,
        body: JSON.stringify({ success: false, error: 'Credenciales inválidas' }),
      }
    }
    
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

// Función para verificar contraseña
// En producción, instala bcryptjs y usa: bcrypt.compare(password, hash)
async function verifyPassword(password, hash) {
  // Si no hay hash almacenado, permitir cualquier contraseña (SOLO DESARROLLO)
  if (!hash) {
    console.warn('[login] No password_hash found for user. Allowing login for development.')
    return true
  }
  
  // Intentar cargar bcryptjs dinámicamente si está disponible
  try {
    const bcrypt = await import('bcryptjs')
    return await bcrypt.compare(password, hash)
  } catch (e) {
    // bcryptjs no está instalado - modo desarrollo
    console.warn('[login] bcryptjs not available. Using plain text comparison (DEV ONLY)')
    // Comparación simple para desarrollo (NO USAR EN PRODUCCIÓN)
    return password === hash
  }
}
