# Mr Huevos POS - Netlify Version

Aplicación POS reescrita para desplegar en **Netlify** con arquitectura JAMstack.

## 🚀 Tecnologías

- **Frontend**: Vue 3 + Vite + TailwindCSS
- **Estado**: Pinia
- **Router**: Vue Router
- **Backend**: Netlify Functions (serverless)
- **Base de Datos**: Supabase (PostgreSQL)

## 📋 Prerrequisitos

1. Node.js 18+
2. Cuenta en [Supabase](https://supabase.com)
3. Cuenta en [Netlify](https://netlify.com)

## 🛠️ Instalación

```bash
cd mr-huevos-pos-netlify
npm install
```

## ⚙️ Configuración

### 1. Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea un proyecto
2. En el SQL Editor, ejecuta el contenido de `supabase/schema.sql`
3. Copia las credenciales:
   - Project URL
   - Anon/Public Key

### 2. Configurar variables de entorno

Crea un archivo `.env`:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales de Supabase:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 🧪 Desarrollo Local

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

**Usuario demo**: `admin` (cualquier contraseña)

## 🚀 Deploy a Netlify

### Opción A: Git (Recomendado)

1. Sube el código a GitHub/GitLab:

```bash
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/tu-usuario/mr-huevos-pos.git
git push -u origin main
```

2. En Netlify:
   - Click en "Add new site" → "Import an existing project"
   - Conecta tu repositorio
   - Configura las variables de entorno:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
   - Click en "Deploy site"

### Opción B: Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

## 📁 Estructura del Proyecto

```
mr-huevos-pos-netlify/
├── src/
│   ├── views/          # Vistas (Login, POS, Reports, Customers)
│   ├── stores/         # Stores de Pinia (auth)
│   ├── router/         # Configuración de rutas
│   ├── assets/         # CSS y recursos
│   ├── App.vue
│   └── main.js
├── netlify/functions/  # Funciones serverless
│   ├── login.js
│   ├── logout.js
│   ├── create-sale.js
│   └── get-reports.js
├── supabase/
│   └── schema.sql      # Schema de base de datos
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── netlify.toml
└── README.md
```

## 🔧 Funciones Serverless

Las funciones están en `netlify/functions/` y se despliegan automáticamente:

- `login` - Autenticación de usuarios
- `logout` - Cerrar sesión
- `create-sale` - Registrar venta
- `get-reports` - Obtener reportes

## 📝 Notas

- **Modo Demo**: La aplicación funciona sin configurar Supabase para propósitos de demostración
- **Producción**: Para producción, conecta las funciones a Supabase Database
- **Redirecciones**: El archivo `netlify.toml` configura SPA routing correctamente

## 🔐 Seguridad

Para producción:

1. Implementa autenticación real con Supabase Auth
2. Valida tokens en las funciones serverless
3. Usa Row Level Security (RLS) en Supabase
4. No expongas claves secretas en el frontend

## 📄 Licencia

MIT
