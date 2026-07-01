<?php
/**
 * Configuración de la base de datos
 * Mr Huevos POS - PHP Version
 */

define('DB_HOST', 'localhost');
define('DB_NAME', 'mr_huevos_pos');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

/**
 * Configuración de la aplicación
 */
define('APP_NAME', 'Mr Huevos POS');
define('APP_URL', 'http://localhost/php-pos/public');
define('SESSION_LIFETIME', 3600); // 1 hora

/**
 * Configuración de errores (cambiar en producción)
 */
error_reporting(E_ALL);
ini_set('display_errors', 1);

/**
 * Zona horaria
 */
date_default_timezone_set('America/Asuncion');
