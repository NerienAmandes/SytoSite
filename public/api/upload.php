<?php
/**
 * Загрузка изображений товаров.
 *
 * POST /api/upload.php  (multipart/form-data, поле file)
 * Ответ: { ok: true, url: '/images/xxx.webp' }
 *
 * Картинки складываются в /public/images/ (доступны по /images/xxx).
 */
require __DIR__ . '/config.php';

require_admin();

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    respond(405, array('ok' => false, 'error' => 'Только POST'));
}

if (empty($_FILES['file'])) {
    respond(400, array('ok' => false, 'error' => 'Файл не передан'));
}

$file = $_FILES['file'];
if ($file['error'] !== UPLOAD_ERR_OK) {
    respond(400, array('ok' => false, 'error' => 'Ошибка загрузки файла'));
}

/* Размер — не более 10 МБ */
if ($file['size'] > 10 * 1024 * 1024) {
    respond(400, array('ok' => false, 'error' => 'Файл слишком большой (макс. 10 МБ)'));
}

/* Проверяем тип — только изображения */
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

$allowed = array(
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp',
    'image/gif'  => 'gif',
);

if (!isset($allowed[$mime])) {
    respond(400, array('ok' => false, 'error' => 'Разрешены только изображения (jpg, png, webp, gif)'));
}

$ext = $allowed[$mime];

/* Имя файла — транслит+случайный суффикс, чтобы не было коллизий */
$origName = pathinfo($file['name'], PATHINFO_FILENAME);
$base = slugify($origName);
if ($base === '') $base = 'image';
$filename = $base . '-' . substr(md5(uniqid((string) mt_rand(), true)), 0, 8) . '.' . $ext;

$destDir = __DIR__ . '/../images';
if (!is_dir($destDir)) {
    mkdir($destDir, 0755, true);
}

$destPath = $destDir . '/' . $filename;

/* Перекодируем в webp, если есть GD — экономим место и трафик.
   Если GD нет — просто копируем как есть. */
if (function_exists('imagecreatefromstring') && function_exists('imagewebp')) {
    $img = @imagecreatefromstring(file_get_contents($file['tmp_name']));
    if ($img !== false) {
        /* Делаем имя с расширением webp */
        $webpName = preg_replace('/\.(jpg|png|gif)$/i', '.webp', $filename);
        $webpPath = $destDir . '/' . $webpName;
        imagepalettetotruecolor($img);
        imagewebp($img, $webpPath, 82);
        imagedestroy($img);
        $filename = $webpName;
        $destPath = $webpPath;
    } else {
        move_uploaded_file($file['tmp_name'], $destPath);
    }
} else {
    move_uploaded_file($file['tmp_name'], $destPath);
}

respond(200, array(
    'ok'  => true,
    'url' => '/images/' . $filename,
));
