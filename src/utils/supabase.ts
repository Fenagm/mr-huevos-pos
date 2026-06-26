// supabase.ts - Cliente de Supabase para conexión directa desde el frontend
// NOTA: Actualmente no se usa - todo pasa por funciones Netlify.
// Para producción, decidir arquitectura:
// Opción A: Frontend -> Supabase directo (más rápido, menos infraestructura)
// Opción B: Frontend -> Netlify Functions -> Supabase (más control, validación centralizada)
// Este archivo está disponible para migrar a Opción A cuando sea necesario.

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
// Nombre estándar de Supabase: VITE_SUPABASE_ANON_KEY
// (antes: VITE_SUPABASE_PUBLISHABLE_KEY — nombre incorrecto que causaba cliente sin inicializar)
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('[supabase] Variables de entorno VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY no definidas. El cliente de Supabase no funcionará.')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
