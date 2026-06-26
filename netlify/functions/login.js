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
  // Buscar usuario haciendo un JOIN con la tabla 'branches' para traer el nombre
  const { data: user, error } = await supabase
    .from('users')
    .select('id, username, role, name, password_hash, branch_id, branches(name)')
    .eq('username', username)
    .single()

  if (error || !user) {
    return {
      statusCode: 401,
      body: JSON.stringify({ success: false, error: 'Credenciales inválidas' }),
    }
  }

  // Verificar contraseña
  const passwordsMatch = await verifyPassword(password, user.password_hash)
  
  if (!passwordsMatch) {
    return {
      statusCode: 401,
      body: JSON.stringify({ success: false, error: 'Credenciales inválidas' }),
    }
  }
  
  // Como estás usando una tabla customizada y no Supabase Auth nativo,
  // generamos un token para que el frontend valide la sesión (en prod puedes usar JWT)
  const fakeToken = `session_${user.id}_${Date.now()}`

  return {
    statusCode: 200,
    body: JSON.stringify({ 
      success: true, 
      token: fakeToken, // <-- Agregado para cumplir con auth.js
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        branchId: user.branch_id,
        branchName: user.branches ? user.branches.name : null, // <-- Agregado para cumplir con auth.js
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
