<?php
/**
 * Авторизация администратора.
 *
 * POST /api/auth.php { action: 'login', username, password }
 * POST /api/auth.php { action: 'logout' }
 * GET  /api/auth.php  → { ok, is_admin }
 */
require __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    respond(200, array('ok' => true, 'is_admin' => is_admin()));
}

if ($method !== 'POST') {
    respond(405, array('ok' => false, 'error' => 'Метод не поддерживается'));
}

$data = input_json();
$action = $data['action'] ?? '';

if ($action === 'logout') {
    $_SESSION = array();
    session_destroy();
    respond(200, array('ok' => true));
}

if ($action === 'login') {
    $username = clean_str($data['username'] ?? '', 100);
    $password = (string) ($data['password'] ?? '');

    if ($username === '' || $password === '') {
        respond(422, array('ok' => false, 'error' => 'Введите логин и пароль'));
    }

    $stmt = db()->prepare('SELECT id, username, password_hash FROM admin_users WHERE username = ? LIMIT 1');
    $stmt->execute(array($username));
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        respond(401, array('ok' => false, 'error' => 'Неверный логин или пароль'));
    }

    session_regenerate_id(true);
    $_SESSION['admin_id'] = (int) $user['id'];
    $_SESSION['admin_username'] = $user['username'];

    respond(200, array('ok' => true, 'username' => $user['username']));
}

respond(400, array('ok' => false, 'error' => 'Неизвестное действие'));
