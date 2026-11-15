<?php
/**
 * Общий конфиг и хелперы для API.
 * Подключается во все эндпоинты /api/*.php
 *
 * Доступы к БД лежат в корне сайта в файле db-config.php
 * (рядом с mail-config.php). Формат см. db-config.php.example.
 */

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

/* CORS — если фронтенд на другом домене, раскомментировать и указать свой домен */
// header('Access-Control-Allow-Origin: https://сыто.su');
// header('Access-Control-Allow-Credentials: true');
// header('Access-Control-Allow-Headers: Content-Type');
// header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

/* ============== Настройки БД ============== */
$DB_CONFIG = array(
    'host' => 'localhost',
    'name' => '',      // имя БД — переопределяется из db-config.php
    'user' => '',      // пользователь БД
    'pass' => '',      // пароль БД
    'charset' => 'utf8mb4',
);

/* Локальный файл с доступами (не в git). */
$dbConfigPath = __DIR__ . '/../db-config.php';
if (is_file($dbConfigPath)) {
    $local = require $dbConfigPath;
    if (is_array($local)) {
        $DB_CONFIG = array_merge($DB_CONFIG, $local);
    }
}

/* ============== Подключение к БД (PDO) ============== */
function db()
{
    global $DB_CONFIG;
    static $pdo = null;
    if ($pdo === null) {
        $dsn = 'mysql:host=' . $DB_CONFIG['host'] . ';dbname=' . $DB_CONFIG['name']
            . ';charset=' . $DB_CONFIG['charset'];
        try {
            $pdo = new PDO($dsn, $DB_CONFIG['user'], $DB_CONFIG['pass'], array(
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ));
        } catch (PDOException $e) {
            respond(500, array('ok' => false, 'error' => 'Ошибка подключения к БД'));
        }
    }
    return $pdo;
}

/* ============== Ответ ============== */
function respond($code, $payload)
{
    http_response_code($code);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

/* ============== Сессия и авторизация ============== */
if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params(array(
        'lifetime' => 0,
        'path' => '/',
        'httponly' => true,
        'samesite' => 'Lax',
    ));
    session_start();
}

function is_admin()
{
    return !empty($_SESSION['admin_id']);
}

function require_admin()
{
    if (!is_admin()) {
        respond(401, array('ok' => false, 'error' => 'Требуется авторизация'));
    }
}

/* ============== Ввод ============== */
function input_json()
{
    $raw = file_get_contents('php://input');
    if ($raw === '' || $raw === false) {
        return array();
    }
    $data = json_decode($raw, true);
    return is_array($data) ? $data : array();
}

function clean_str($value, $max = null)
{
    $s = trim((string) $value);
    if ($max !== null) {
        $s = mb_substr($s, 0, (int) $max);
    }
    return $s;
}

/* ============== Транслит для slug ============== */
function slugify($text)
{
    $text = mb_strtolower(clean_str($text), 'UTF-8');
    $map = array(
        'а' => 'a', 'б' => 'b', 'в' => 'v', 'г' => 'g', 'д' => 'd',
        'е' => 'e', 'ё' => 'e', 'ж' => 'zh', 'з' => 'z', 'и' => 'i',
        'й' => 'y', 'к' => 'k', 'л' => 'l', 'м' => 'm', 'н' => 'n',
        'о' => 'o', 'п' => 'p', 'р' => 'r', 'с' => 's', 'т' => 't',
        'у' => 'u', 'ф' => 'f', 'х' => 'kh', 'ц' => 'ts', 'ч' => 'ch',
        'ш' => 'sh', 'щ' => 'sch', 'ъ' => '', 'ы' => 'y', 'ь' => '',
        'э' => 'e', 'ю' => 'yu', 'я' => 'ya',
    );
    $text = strtr($text, $map);
    $text = preg_replace('/[^a-z0-9]+/', '-', $text);
    $text = trim($text, '-');
    return $text === '' ? 'produkt' : $text;
}

/* Уникальный slug — если такой уже есть, добавляем -2, -3 ... */
function unique_slug($slug, $table, $excludeId = null)
{
    $pdo = db();
    $base = $slug;
    $i = 1;
    while (true) {
        $stmt = $pdo->prepare("SELECT id FROM `{$table}` WHERE slug = ? LIMIT 1");
        $stmt->execute(array($slug));
        $row = $stmt->fetch();
        if (!$row || ($excludeId !== null && (int) $row['id'] === (int) $excludeId)) {
            return $slug;
        }
        $i++;
        $slug = $base . '-' . $i;
    }
}
