# Mr Huevos POS - PHP Version

Sistema de Punto de Venta adaptado a PHP, HTML, JavaScript, MySQL y TailwindCSS.

## Estructura del Proyecto

```
php-pos/
├── api/                    # Endpoints API (JSON)
│   ├── login.php          # Autenticación
│   ├── logout.php         # Cerrar sesión
│   ├── get-products.php   # Obtener productos
│   ├── save-product.php   # Guardar producto
│   ├── create-sale.php    # Crear venta
│   └── get-customers.php  # Obtener clientes
├── public/                 # Páginas web
│   ├── login.php          # Página de login
│   ├── pos.php            # Punto de venta
│   ├── inventory.php      # Inventario (pendiente)
│   └── reports.php        # Reportes (pendiente)
├── includes/               # Código PHP compartido
│   ├── config.php         # Configuración
│   ├── database.php       # Conexión DB
│   └── auth.php           # Funciones de autenticación
├── assets/                 # Recursos estáticos
│   └── styles.css         # Estilos Tailwind
└── database/
    └── schema.sql         # Esquema de base de datos
```

## Requisitos

- PHP 7.4 o superior
- MySQL 5.7 o MariaDB 10.3
- Node.js (opcional, para compilar Tailwind)

## Instalación

### 1. Configurar Base de Datos

```bash
mysql -u root -p < database/schema.sql
```

O importar manualmente el archivo `database/schema.sql` en phpMyAdmin o similar.

### 2. Configurar Credenciales

Editar `includes/config.php`:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'mr_huevos_pos');
define('DB_USER', 'tu_usuario');
define('DB_PASS', 'tu_contraseña');
define('APP_URL', 'http://localhost/php-pos/public');
```

### 3. Configurar Servidor Web

#### Apache (.htaccess)

Colocar en `public/.htaccess`:

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^(.*)$ index.php [QSA,L]
```

#### Nginx

```nginx
server {
    listen 80;
    server_name localhost;
    root /var/www/html/php-pos/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

### 4. Acceder al Sistema

Abrir navegador en: `http://localhost/php-pos/public/login.php`

**Usuarios por defecto:**
- admin / admin123
- encargado / encargado123
- vendedor / vendedor123

## Características

- ✅ Autenticación segura con sesiones PHP
- ✅ Roles de usuario (admin, manager, seller)
- ✅ Punto de venta (POS) funcional
- ✅ Gestión de productos e inventario
- ✅ Caja diaria (apertura/cierre)
- ✅ Clientes y cuentas corrientes
- ✅ Ventas para delivery
- ✅ API RESTful JSON
- ✅ Diseño responsive con TailwindCSS
- ✅ Compatible con mobile

## Módulos Incluidos

1. **POS** - Punto de venta principal
2. **Inventario** - Gestión de productos y stock
3. **Caja** - Apertura, gastos y cierre
4. **Clientes** - Gestión y cuentas corrientes
5. **Ventas** - Historial y reportes
6. **Logística** - Entregas y vehículos (pendiente)

## APIs Disponibles

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/login.php` | POST | Iniciar sesión |
| `/api/logout.php` | POST | Cerrar sesión |
| `/api/get-products.php` | GET | Listar productos |
| `/api/save-product.php` | POST | Crear/actualizar producto |
| `/api/create-sale.php` | POST | Registrar venta |
| `/api/get-customers.php` | GET | Listar clientes |

## Seguridad

- Sesiones seguras con cookies HTTP-only
- Protección CSRF implementada
- Consultas preparadas (PDO) contra SQL injection
- Hash de contraseñas con bcrypt
- Validación de roles por página

## Licencia

Proyecto de código abierto para uso educativo y comercial.
