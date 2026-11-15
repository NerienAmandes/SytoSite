<?php
/**
 * Категории: список (публично) + CRUD (админ).
 *
 * GET    /api/categories.php        → список категорий
 * POST   /api/categories.php        → создать (админ)
 * PUT    /api/categories.php?id=1   → обновить (админ)
 * DELETE /api/categories.php?id=1   → удалить (админ)
 */
require __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$pdo = db();

if ($method === 'GET') {
    $rows = $pdo->query(
        'SELECT id, slug, title, short_description, accent, image, sort_order
         FROM categories ORDER BY sort_order ASC, id ASC'
    )->fetchAll();
    $out = array();
    foreach ($rows as $r) {
        $out[] = array(
            'id'              => (int) $r['id'],
            'slug'            => $r['slug'],
            'title'           => $r['title'],
            'shortDescription'=> $r['short_description'] ?: '',
            'accent'          => $r['accent'] ?: '',
            'image'           => $r['image'] ?: '',
        );
    }
    respond(200, array('ok' => true, 'categories' => $out));
}

if ($method === 'POST') {
    require_admin();
    $data = input_json();
    $cat = save_category(null, $data);
    respond(201, array('ok' => true, 'category' => $cat));
}

if ($method === 'PUT') {
    require_admin();
    $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
    if ($id <= 0) { $data = input_json(); $id = (int) ($data['id'] ?? 0); }
    if ($id <= 0) respond(400, array('ok' => false, 'error' => 'Не указан id'));
    $data = input_json();
    $cat = save_category($id, $data);
    respond(200, array('ok' => true, 'category' => $cat));
}

if ($method === 'DELETE') {
    require_admin();
    $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
    if ($id <= 0) respond(400, array('ok' => false, 'error' => 'Не указан id'));
    $pdo->prepare('DELETE FROM categories WHERE id = ?')->execute(array($id));
    respond(200, array('ok' => true));
}

respond(405, array('ok' => false, 'error' => 'Метод не поддерживается'));

function save_category($id, array $data)
{
    $pdo = db();
    $title = clean_str($data['title'] ?? '', 255);
    if ($title === '') respond(422, array('ok' => false, 'error' => 'Укажите название категории'));

    $slug = isset($data['slug']) && trim($data['slug']) !== '' ? slugify($data['slug']) : slugify($title);
    $slug = unique_slug($slug, 'categories', $id);

    $short = clean_str($data['shortDescription'] ?? '');
    $accent = clean_str($data['accent'] ?? '', 50);
    $image = clean_str($data['image'] ?? '', 255);

    if ($id === null) {
        $stmt = $pdo->prepare('INSERT INTO categories (slug, title, short_description, accent, image) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute(array($slug, $title, $short, $accent, $image));
        $id = (int) $pdo->lastInsertId();
    } else {
        $stmt = $pdo->prepare('UPDATE categories SET slug=?, title=?, short_description=?, accent=?, image=? WHERE id=?');
        $stmt->execute(array($slug, $title, $short, $accent, $image, $id));
    }
    $stmt = $pdo->prepare('SELECT id, slug, title, short_description, accent, image FROM categories WHERE id = ?');
    $stmt->execute(array($id));
    $r = $stmt->fetch();
    return array(
        'id' => (int) $r['id'],
        'slug' => $r['slug'],
        'title' => $r['title'],
        'shortDescription' => $r['short_description'] ?: '',
        'accent' => $r['accent'] ?: '',
        'image' => $r['image'] ?: '',
    );
}
