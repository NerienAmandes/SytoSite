<?php
/**
 * Товары: CRUD.
 *
 * GET  /api/products.php                 → список всех товаров (публично)
 * GET  /api/products.php?slug=xxx        → один товар по slug (публично)
 * GET  /api/products.php?id=123          → один товар по id (публично)
 * POST /api/products.php                 → создать товар (админ)
 * PUT  /api/products.php?id=123          → обновить товар (админ)
 * DELETE /api/products.php?id=123        → удалить товар (админ)
 */
require __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$pdo = db();

/* ============== Публичное чтение ============== */
if ($method === 'GET') {
    $slug = isset($_GET['slug']) ? clean_str($_GET['slug'], 200) : '';
    $id   = isset($_GET['id']) ? (int) $_GET['id'] : 0;

    if ($slug !== '' || $id > 0) {
        $product = $slug !== ''
            ? fetch_product_by('slug', $slug)
            : fetch_product_by('id', $id);
        if (!$product) {
            respond(404, array('ok' => false, 'error' => 'Товар не найден'));
        }
        respond(200, array('ok' => true, 'product' => $product));
    }

    /* Список всех товаров */
    $products = fetch_all_products();
    respond(200, array('ok' => true, 'products' => $products));
}

/* ============== Создание (админ) ============== */
if ($method === 'POST') {
    require_admin();
    $data = input_json();
    $product = save_product(null, $data);
    respond(201, array('ok' => true, 'product' => $product));
}

/* ============== Обновление (админ) ============== */
if ($method === 'PUT') {
    require_admin();
    $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
    if ($id <= 0) {
        $data = input_json();
        $id = (int) ($data['id'] ?? 0);
    }
    if ($id <= 0) {
        respond(400, array('ok' => false, 'error' => 'Не указан id товара'));
    }
    $data = input_json();
    $product = save_product($id, $data);
    respond(200, array('ok' => true, 'product' => $product));
}

/* ============== Удаление (админ) ============== */
if ($method === 'DELETE') {
    require_admin();
    $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
    if ($id <= 0) {
        respond(400, array('ok' => false, 'error' => 'Не указан id товара'));
    }
    $stmt = $pdo->prepare('DELETE FROM products WHERE id = ?');
    $stmt->execute(array($id));
    respond(200, array('ok' => true));
}

respond(405, array('ok' => false, 'error' => 'Метод не поддерживается'));

/* ============================================================ */
/* ==================== Вспомогательные ======================= */
/* ============================================================ */

function fetch_all_products()
{
    $pdo = db();
    $rows = $pdo->query(
        'SELECT p.*, c.slug AS category_slug
         FROM products p
         LEFT JOIN categories c ON c.id = p.category_id
         ORDER BY p.sort_order ASC, p.id ASC'
    )->fetchAll();

    $ids = array_map(function ($r) { return (int) $r['id']; }, $rows);
    $variants = fetch_variants($ids);
    $tags     = fetch_tags($ids);

    $out = array();
    foreach ($rows as $r) {
        $out[] = row_to_product($r, $variants[$r['id']] ?? array(), $tags[$r['id']] ?? array());
    }
    return $out;
}

function fetch_product_by($field, $value)
{
    $pdo = db();
    $stmt = $pdo->prepare(
        "SELECT p.*, c.slug AS category_slug
         FROM products p
         LEFT JOIN categories c ON c.id = p.category_id
         WHERE p.{$field} = ? LIMIT 1"
    );
    $stmt->execute(array($value));
    $r = $stmt->fetch();
    if (!$r) return null;
    $variants = fetch_variants(array((int) $r['id']));
    $tags     = fetch_tags(array((int) $r['id']));
    return row_to_product($r, $variants[$r['id']] ?? array(), $tags[$r['id']] ?? array());
}

function fetch_variants(array $ids)
{
    if (!$ids) return array();
    $pdo = db();
    $in = implode(',', array_fill(0, count($ids), '?'));
    $stmt = $pdo->prepare(
        "SELECT * FROM product_variants WHERE product_id IN ({$in}) ORDER BY sort_order ASC, id ASC"
    );
    $stmt->execute($ids);
    $out = array();
    foreach ($stmt->fetchAll() as $v) {
        $pid = (int) $v['product_id'];
        $out[$pid][] = array(
            'label' => $v['label'],
            'price' => (float) $v['price'],
            'image' => $v['image'] ?: null,
        );
    }
    return $out;
}

function fetch_tags(array $ids)
{
    if (!$ids) return array();
    $pdo = db();
    $in = implode(',', array_fill(0, count($ids), '?'));
    $stmt = $pdo->prepare("SELECT * FROM product_tags WHERE product_id IN ({$in}) ORDER BY id ASC");
    $stmt->execute($ids);
    $out = array();
    foreach ($stmt->fetchAll() as $t) {
        $out[(int) $t['product_id']][] = $t['tag'];
    }
    return $out;
}

function row_to_product($r, array $variants, array $tags)
{
    return array(
        'id'              => (int) $r['id'],
        'slug'            => $r['slug'],
        'category'        => $r['category_slug'] ?: '',
        'title'           => $r['title'],
        'shortDescription'=> $r['short_description'] ?: '',
        'description'     => $r['description'] ?: '',
        'image'           => $r['image'] ?: '',
        'available'       => (bool) $r['available'],
        'featured'        => (bool) $r['featured'],
        'tags'            => $tags,
        'pricePer'        => $r['price_per'] ?: '',
        'variants'        => $variants,
    );
}

/**
 * Создаёт или обновляет товар целиком (с вариантами и тегами).
 * $id === null → создание, иначе обновление.
 */
function save_product($id, array $data)
{
    $pdo = db();

    $title   = clean_str($data['title'] ?? '', 255);
    if ($title === '') {
        respond(422, array('ok' => false, 'error' => 'Укажите название товара'));
    }

    $slug = isset($data['slug']) && trim($data['slug']) !== ''
        ? slugify($data['slug'])
        : slugify($title);
    $slug = unique_slug($slug, 'products', $id);

    $categorySlug = clean_str($data['category'] ?? '', 100);
    $categoryId = null;
    if ($categorySlug !== '') {
        $stmt = $pdo->prepare('SELECT id FROM categories WHERE slug = ? LIMIT 1');
        $stmt->execute(array($categorySlug));
        $cat = $stmt->fetch();
        if ($cat) {
            $categoryId = (int) $cat['id'];
        }
    }

    $short = clean_str($data['shortDescription'] ?? '');
    $desc  = (string) ($data['description'] ?? '');
    $image = clean_str($data['image'] ?? '', 255);
    $pricePer = clean_str($data['pricePer'] ?? '', 50);
    $available = !empty($data['available']) ? 1 : 0;
    $featured  = !empty($data['featured']) ? 1 : 0;

    if ($id === null) {
        $stmt = $pdo->prepare(
            'INSERT INTO products (slug, category_id, title, short_description, description, image, available, featured, price_per)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute(array($slug, $categoryId, $title, $short, $desc, $image, $available, $featured, $pricePer));
        $id = (int) $pdo->lastInsertId();
    } else {
        $stmt = $pdo->prepare(
            'UPDATE products SET slug=?, category_id=?, title=?, short_description=?, description=?, image=?, available=?, featured=?, price_per=?
             WHERE id=?'
        );
        $stmt->execute(array($slug, $categoryId, $title, $short, $desc, $image, $available, $featured, $pricePer, $id));
    }

    /* Варианты — пересобираем полностью */
    $pdo->prepare('DELETE FROM product_variants WHERE product_id = ?')->execute(array($id));
    $variants = isset($data['variants']) && is_array($data['variants']) ? $data['variants'] : array();
    $sort = 0;
    $insVariant = $pdo->prepare(
        'INSERT INTO product_variants (product_id, label, price, image, sort_order) VALUES (?, ?, ?, ?, ?)'
    );
    foreach ($variants as $v) {
        $label = clean_str($v['label'] ?? '', 100);
        $price = isset($v['price']) ? (float) $v['price'] : 0;
        $vimage = isset($v['image']) ? clean_str($v['image'], 255) : null;
        if ($label === '') continue;
        $insVariant->execute(array($id, $label, $price, $vimage, $sort));
        $sort++;
    }

    /* Теги — пересобираем полностью */
    $pdo->prepare('DELETE FROM product_tags WHERE product_id = ?')->execute(array($id));
    $tags = isset($data['tags']) && is_array($data['tags']) ? $data['tags'] : array();
    $insTag = $pdo->prepare('INSERT INTO product_tags (product_id, tag) VALUES (?, ?)');
    foreach ($tags as $tag) {
        $t = clean_str($tag, 100);
        if ($t === '') continue;
        $insTag->execute(array($id, $t));
    }

    return fetch_product_by('id', $id);
}
