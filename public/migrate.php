<?php
/**
 * Миграция данных из JSON (src/data/*.json) в MySQL.
 *
 * Запуск:
 *   1. Залейте этот файл в корень сайта (рядом с index.html)
 *   2. Откройте в браузере: https://сыто.su/migrate.php
 *   3. После завершения УДАЛИТЕ файл migrate.php с сервера!
 *
 * Требует:
 *   - public/db-config.php с доступами к БД
 *   - выполненную схему scripts/schema.sql
 *   - файлы products.json и categories.json (лежат в src/data)
 *
 * Скрипт импортирует категории, товары, варианты и теги.
 * Повторный запуск обновляет существующие записи по slug.
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: text/plain; charset=utf-8');

/* --- Конфиг БД --- */
$DB_CONFIG = array('host' => 'localhost', 'name' => '', 'user' => '', 'pass' => '', 'charset' => 'utf8mb4');
$dbConfigPath = __DIR__ . '/db-config.php';
if (is_file($dbConfigPath)) {
    $local = require $dbConfigPath;
    if (is_array($local)) $DB_CONFIG = array_merge($DB_CONFIG, $local);
}

if ($DB_CONFIG['name'] === '') {
    die("ОШИБКА: не заданы доступы к БД. Создайте db-config.php по образцу db-config.php.example\n");
}

try {
    $pdo = new PDO(
        'mysql:host=' . $DB_CONFIG['host'] . ';dbname=' . $DB_CONFIG['name'] . ';charset=' . $DB_CONFIG['charset'],
        $DB_CONFIG['user'],
        $DB_CONFIG['pass'],
        array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION)
    );
} catch (PDOException $e) {
    die("ОШИБКА подключения к БД: " . $e->getMessage() . "\n");
}

/* --- Путь к JSON --- */
$productsJsonPath = __DIR__ . '/products.json';
$categoriesJsonPath = __DIR__ . '/categories.json';

/* Если в корне нет — берём из data/ (заливается на сервер вместе с сайтом) */
if (!is_file($productsJsonPath)) {
    $productsJsonPath = __DIR__ . '/data/products.json';
    $categoriesJsonPath = __DIR__ . '/data/categories.json';
}
/* Локально (в репозитории) — берём из src/data */
if (!is_file($productsJsonPath)) {
    $productsJsonPath = __DIR__ . '/src/data/products.json';
    $categoriesJsonPath = __DIR__ . '/src/data/categories.json';
}
if (!is_file($productsJsonPath)) {
    die("ОШИБКА: products.json не найден ни в корне, ни в data/, ни в src/data/\n");
}

echo "Читаем JSON...\n";
$productsRaw = json_decode(file_get_contents($productsJsonPath), true);
$categoriesRaw = json_decode(file_get_contents($categoriesJsonPath), true);

$products = is_array($productsRaw) && isset($productsRaw['products']) ? $productsRaw['products'] : $productsRaw;
$categories = is_array($categoriesRaw) && isset($categoriesRaw['categories']) ? $categoriesRaw['categories'] : $categoriesRaw;

echo "Категорий: " . count($categories) . ", товаров: " . count($products) . "\n\n";

/* --- Вспомогательные функции --- */
function slugify($text) {
    $text = mb_strtolower(trim((string)$text), 'UTF-8');
    $map = array(
        'а'=>'a','б'=>'b','в'=>'v','г'=>'g','д'=>'d','е'=>'e','ё'=>'e','ж'=>'zh','з'=>'z','и'=>'i',
        'й'=>'y','к'=>'k','л'=>'l','м'=>'m','н'=>'n','о'=>'o','п'=>'p','р'=>'r','с'=>'s','т'=>'t',
        'у'=>'u','ф'=>'f','х'=>'kh','ц'=>'ts','ч'=>'ch','ш'=>'sh','щ'=>'sch','ъ'=>'','ы'=>'y','ь'=>'',
        'э'=>'e','ю'=>'yu','я'=>'ya',
    );
    $text = strtr($text, $map);
    $text = preg_replace('/[^a-z0-9]+/', '-', $text);
    return trim($text, '-');
}

/* --- Импорт категорий --- */
echo "=== Категории ===\n";
$catMap = array(); // slug => id
foreach ($categories as $cat) {
    $slug = $cat['slug'] ?? slugify($cat['title']);
    $stmt = $pdo->prepare('SELECT id FROM categories WHERE slug = ?');
    $stmt->execute(array($slug));
    $existing = $stmt->fetch();

    if ($existing) {
        $stmt = $pdo->prepare(
            'UPDATE categories SET title=?, short_description=?, accent=?, image=? WHERE id=?'
        );
        $stmt->execute(array(
            $cat['title'],
            $cat['shortDescription'] ?? '',
            $cat['accent'] ?? '',
            $cat['image'] ?? '',
            $existing['id'],
        ));
        $catMap[$slug] = (int) $existing['id'];
        echo "  обновлена: {$cat['title']} ({$slug})\n";
    } else {
        $stmt = $pdo->prepare(
            'INSERT INTO categories (slug, title, short_description, accent, image) VALUES (?, ?, ?, ?, ?)'
        );
        $stmt->execute(array(
            $slug,
            $cat['title'],
            $cat['shortDescription'] ?? '',
            $cat['accent'] ?? '',
            $cat['image'] ?? '',
        ));
        $catMap[$slug] = (int) $pdo->lastInsertId();
        echo "  добавлена: {$cat['title']} ({$slug})\n";
    }
}

/* --- Импорт товаров --- */
echo "\n=== Товары ===\n";
$productCount = 0;
foreach ($products as $p) {
    $slug = $p['slug'] ?? slugify($p['title']);
    $categoryId = isset($catMap[$p['category'] ?? '']) ? $catMap[$p['category']] : null;

    $stmt = $pdo->prepare('SELECT id FROM products WHERE slug = ?');
    $stmt->execute(array($slug));
    $existing = $stmt->fetch();

    $available = !empty($p['available']) ? 1 : 0;
    $featured  = !empty($p['featured']) ? 1 : 0;

    if ($existing) {
        $pid = (int) $existing['id'];
        $stmt = $pdo->prepare(
            'UPDATE products SET category_id=?, title=?, short_description=?, description=?, image=?, available=?, featured=?, price_per=? WHERE id=?'
        );
        $stmt->execute(array(
            $categoryId,
            $p['title'],
            $p['shortDescription'] ?? '',
            $p['description'] ?? '',
            $p['image'] ?? '',
            $available,
            $featured,
            $p['pricePer'] ?? '',
            $pid,
        ));
        echo "  обновлён: {$p['title']}\n";
    } else {
        $stmt = $pdo->prepare(
            'INSERT INTO products (slug, category_id, title, short_description, description, image, available, featured, price_per)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute(array(
            $slug,
            $categoryId,
            $p['title'],
            $p['shortDescription'] ?? '',
            $p['description'] ?? '',
            $p['image'] ?? '',
            $available,
            $featured,
            $p['pricePer'] ?? '',
        ));
        $pid = (int) $pdo->lastInsertId();
        echo "  добавлен: {$p['title']}\n";
    }

    /* Варианты — пересобираем */
    $pdo->prepare('DELETE FROM product_variants WHERE product_id = ?')->execute(array($pid));
    $sort = 0;
    $insV = $pdo->prepare('INSERT INTO product_variants (product_id, label, price, image, sort_order) VALUES (?, ?, ?, ?, ?)');
    foreach (($p['variants'] ?? array()) as $v) {
        $insV->execute(array($pid, $v['label'] ?? '', (float)($v['price'] ?? 0), $v['image'] ?? null, $sort));
        $sort++;
    }

    /* Теги — пересобираем */
    $pdo->prepare('DELETE FROM product_tags WHERE product_id = ?')->execute(array($pid));
    $insT = $pdo->prepare('INSERT INTO product_tags (product_id, tag) VALUES (?, ?)');
    foreach (($p['tags'] ?? array()) as $t) {
        $insT->execute(array($pid, $t));
    }

    $productCount++;
}

echo "\nГотово! Импортировано товаров: {$productCount}\n";
echo "\nВАЖНО: удалите файл migrate.php с сервера!\n";
