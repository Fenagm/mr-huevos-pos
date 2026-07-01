<?php
/**
 * API: Obtener productos
 * Mr Huevos POS - PHP Version
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/database.php';

startSecureSession();

// Verificar autenticación
if (!isAuthenticated()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'No autorizado']);
    exit;
}

try {
    $db = getDB();
    $user = getCurrentUser();
    
    // Obtener parámetros
    $branchId = $_GET['branchId'] ?? null;
    
    // Construir consulta
    $sql = "SELECT * FROM products WHERE active = 1";
    $params = [];
    
    if ($branchId) {
        $sql .= " AND branch_id = ?";
        $params[] = $branchId;
    } elseif ($user['branch_id']) {
        $sql .= " AND (branch_id = ? OR branch_id IS NULL)";
        $params[] = $user['branch_id'];
    }
    
    $sql .= " ORDER BY name ASC";
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $products = $stmt->fetchAll();
    
    // Formatear respuesta
    $formattedProducts = array_map(function($p) {
        return [
            'id' => $p['id'],
            'name' => $p['name'],
            'costPrice' => floatval($p['cost_price']),
            'retailPrice' => floatval($p['retail_price']),
            'wholesalePrice' => floatval($p['wholesale_price']),
            'stock' => intval($p['stock']),
            'active' => (bool)$p['active'],
            'branchId' => $p['branch_id'],
            'createdAt' => $p['created_at'],
        ];
    }, $products);
    
    echo json_encode(['success' => true, 'products' => $formattedProducts]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
