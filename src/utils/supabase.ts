// supabase.ts - Cliente de Supabase para conexión directa desde el frontend
// NOTA: Actualmente no se usa - todo pasa por funciones Netlify.
// Para producción, decidir arquitectura:
// Opción A: Frontend -> Supabase directo (más rápido, menos infraestructura)
// Opción B: Frontend -> Netlify Functions -> Supabase (más control, validación centralizada)
// Este archivo está disponible para migrar a Opción A cuando sea necesario.

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
