<?php
/**
 * Приём заказов и заявок с сайта → отправка на почту.
 *
 * Файл лежит в корне сайта: public/send-order.php → после сборки dist/send-order.php.
 * Фронтенд шлёт POST с JSON:
 *   { type: 'order'|'request', name, phone, comment, items[], total, page, website }
 *
 * Доступы к ящику хранятся в отдельном файле mail-config.php (он не попадает в git).
 * Файл mail-config.php.example показывает формат.
 *
 * Домен ящика кириллический (сыто.su), поэтому в настройках адрес задан
 * в punycode: syto@xn--n1afd9a.su. SMTP кириллицу не понимает.
 */

/* ====================== НАСТРОЙКИ ====================== */

$config = array(
    /* Куда присылать заказы и заявки */
    'mail_to'       => 'dmitriikolistratov@mail.ru',
    'mail_to_name'  => 'Сыто — ЭКОферма',

    /* SMTP-отправитель: ящик домена на хостинге sweb.ru */
    'smtp_host'     => 'smtp.spaceweb.ru',
    'smtp_port'     => 465,
    'smtp_secure'   => 'ssl', /* ssl (порт 465) | tls (порт 587) | '' (порт 25) */
    'smtp_user'     => 'syto@xn--n1afd9a.su', /* syto@сыто.su */
    'smtp_pass'     => '',

    /* Адрес отправителя в письме. Если пусто — берётся smtp_user. */
    'mail_from'     => '',
    'mail_from_name' => 'Сайт Сыто',

    /* Домен сайта: используется в EHLO и Message-ID (ASCII/punycode) */
    'site_domain'   => 'xn--n1afd9a.su',
);

/* Локальный файл с доступами к почте (загружается на сервер вручную). */
if (is_file(__DIR__ . '/mail-config.php')) {
    $local = require __DIR__ . '/mail-config.php';
    if (is_array($local)) {
        $config = array_merge($config, $local);
    }
}

if ($config['mail_from'] === '') {
    $config['mail_from'] = $config['smtp_user'] !== ''
        ? $config['smtp_user']
        : 'noreply@xn--n1afd9a.su';
}

/* ASCII-версия адреса отправителя — её подставляем в SMTP-заголовки. */
try {
    $config['mail_from_ascii'] = ascii_email($config['mail_from']);
} catch (Exception $e) {
    log_line('ОШИБКА адреса отправителя: ' . $e->getMessage());
    respond(500, array('ok' => false, 'error' => 'Не удалось отправить письмо'));
}

/* ====================================================== */

/* Отвечаем только JSON */
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

/* GET — проверка, что обработчик вообще жив (открыть файл в браузере). */
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    respond(200, array(
        'ok' => true,
        'service' => 'send-order',
        'message' => 'Обработчик заказов работает. Заказы принимаются методом POST.',
    ));
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!is_array($data)) {
    respond(400, array('ok' => false, 'error' => 'Не удалось разобрать данные заявки'));
}

/* Ловушка для ботов: невидимое поле. Если его заполнили — молча считаем, что всё хорошо. */
if (!empty($data['website'])) {
    respond(200, array('ok' => true));
}

$name    = trim((string) ($data['name'] ?? ''));
$phone   = trim((string) ($data['phone'] ?? ''));
$comment = trim((string) ($data['comment'] ?? ''));
$page    = trim((string) ($data['page'] ?? ''));
$type    = (($data['type'] ?? '') === 'request') ? 'request' : 'order';
$items   = isset($data['items']) && is_array($data['items']) ? $data['items'] : array();

if ($name === '') {
    respond(422, array('ok' => false, 'error' => 'Укажите имя'));
}
if ($phone === '' || strlen($phone) < 5) {
    respond(422, array('ok' => false, 'error' => 'Укажите телефон'));
}

$isOrder  = ($type === 'order' && count($items) > 0);
$subject  = $isOrder
    ? 'Новый заказ с сайта: ' . $name
    : 'Новая заявка с сайта: ' . $name;

$bodyText = build_text($name, $phone, $comment, $page, $items, $isOrder);
$bodyHtml = build_html($name, $phone, $comment, $page, $items, $isOrder);

try {
    if ($config['smtp_user'] !== '' && $config['smtp_pass'] !== '') {
        $channel = 'smtp';
        smtp_send($config['mail_to'], $subject, $bodyText, $bodyHtml, $phone);
    } else {
        $channel = 'mail()';
        log_line('ВНИМАНИЕ: пароль SMTP не задан (нет mail-config.php) — письмо отправлено через mail()');
        mail_send($config['mail_to'], $subject, $bodyText, $bodyHtml, $phone);
    }

    log_line('OK [' . $channel . '] ' . $type . ' от ' . $name . ', тел. ' . $phone);
    respond(200, array('ok' => true));
} catch (Exception $e) {
    $message = $e->getMessage();
    log_line('ОШИБКА отправки: ' . $message);
    error_log('[send-order] ' . $message);
    /* Детали ошибки не отдаём наружу — только в лог. */
    respond(500, array('ok' => false, 'error' => 'Не удалось отправить письмо'));
}

/* ====================== Вспомогательные функции ====================== */

function respond($code, $payload)
{
    http_response_code($code);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Приводит домен в адресе к ASCII (punycode).
 * syto@сыто.su → syto@xn--n1afd9a.su
 */
function ascii_email($email)
{
    $email = trim((string) $email);
    $at = strrpos($email, '@');
    if ($at === false) {
        return $email;
    }

    $local = substr($email, 0, $at);
    $domain = substr($email, $at + 1);

    /* Домен уже ASCII — ничего менять не нужно. */
    if (preg_match('/^[\x20-\x7E]+$/', $domain)) {
        return $email;
    }

    if (function_exists('idn_to_ascii')) {
        $variant = defined('INTL_IDNA_VARIANT_UTS46') ? INTL_IDNA_VARIANT_UTS46 : IDNA_DEFAULT;
        $ascii = @idn_to_ascii($domain, IDNA_DEFAULT, $variant);
        if ($ascii === false) {
            $ascii = @idn_to_ascii($domain, IDNA_DEFAULT);
        }
        if ($ascii !== false && $ascii !== '') {
            return $local . '@' . $ascii;
        }
    }

    throw new Exception(
        'не удалось перевести домен "' . $domain . '" в punycode — укажите адрес явно, например syto@xn--n1afd9a.su'
    );
}

/**
 * Пишет строку в send-order.log рядом со скриптом.
 * Нужен, чтобы на хостинге видеть, доходят ли заказы и с какой ошибкой.
 */
function log_line($message)
{
    $line = '[' . date('d.m.Y H:i:s') . '] ' . $message . PHP_EOL;
    @file_put_contents(__DIR__ . '/send-order.log', $line, FILE_APPEND | LOCK_EX);
}

/** Кодирует имя отправителя/получателя для заголовка письма. */
function encode_name($name)
{
    if (preg_match('/^[\x20-\x7E]*$/', $name)) {
        return '"' . str_replace('"', '', $name) . '"';
    }
    return '=?UTF-8?B?' . base64_encode($name) . '?=';
}

/** Кодирует тему письма (UTF-8 base64). */
function encode_subject($subject)
{
    return '=?UTF-8?B?' . base64_encode($subject) . '?=';
}

/** Сумма позиций заказа в рублях. */
function items_total($items)
{
    $sum = 0;
    foreach ($items as $item) {
        $sum += (float) ($item['total'] ?? 0);
    }
    return $sum;
}

/** Текстовое письмо. */
function build_text($name, $phone, $comment, $page, $items, $isOrder)
{
    $lines = array();
    $lines[] = $isOrder ? 'Новый заказ с сайта' : 'Новая заявка с сайта';
    $lines[] = 'Дата: ' . date('d.m.Y H:i');
    $lines[] = '';
    $lines[] = 'Имя: ' . $name;
    $lines[] = 'Телефон: ' . $phone;

    if ($comment !== '') {
        $lines[] = '';
        $lines[] = 'Комментарий: ' . $comment;
    }

    if ($isOrder) {
        $lines[] = '';
        $lines[] = 'Состав заказа:';
        foreach ($items as $i => $item) {
            $title = trim((string) ($item['title'] ?? ''));
            $variant = trim((string) ($item['variant'] ?? ''));
            $price = (float) ($item['price'] ?? 0);
            $qty = (int) ($item['qty'] ?? 1);
            $total = (float) ($item['total'] ?? 0);
            $line = ($i + 1) . '. ' . $title;
            if ($variant !== '') {
                $line .= ' (' . $variant . ')';
            }
            $line .= ' — ' . format_price($price) . ' ₽ × ' . $qty . ' шт = ' . format_price($total) . ' ₽';
            $lines[] = $line;
        }
        $lines[] = '';
        $lines[] = 'Итого: ' . format_price(items_total($items)) . ' ₽';
    }

    if ($page !== '') {
        $lines[] = '';
        $lines[] = 'Страница: ' . $page;
    }

    return implode("\r\n", $lines);
}

/** HTML-версия письма. */
function build_html($name, $phone, $comment, $page, $items, $isOrder)
{
    $h = array();
    $h[] = '<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#2C241B;">';
    $h[] = '<h2 style="margin:0 0 12px;">' . ($isOrder ? 'Новый заказ с сайта' : 'Новая заявка с сайта') . '</h2>';
    $h[] = '<p style="margin:0 0 4px;color:#6b5f50;">Дата: ' . date('d.m.Y H:i') . '</p>';
    $h[] = '<table cellpadding="6" cellspacing="0" style="border-collapse:collapse;margin:8px 0 16px;">';
    $h[] = '<tr><td style="color:#6b5f50;">Имя:</td><td><strong>' . h($name) . '</strong></td></tr>';
    $h[] = '<tr><td style="color:#6b5f50;">Телефон:</td><td><strong>' . h($phone) . '</strong></td></tr>';
    $h[] = '</table>';

    if ($comment !== '') {
        $h[] = '<p style="margin:0 0 16px;"><strong>Комментарий:</strong> ' . nl2br(h($comment)) . '</p>';
    }

    if ($isOrder) {
        $h[] = '<p style="margin:0 0 8px;"><strong>Состав заказа:</strong></p>';
        $h[] = '<table cellpadding="8" cellspacing="0" style="border-collapse:collapse;border:1px solid #D9CFB8;">';
        $h[] = '<tr style="background:#F5F1E8;text-align:left;">'
            . '<th style="border:1px solid #D9CFB8;">Товар</th>'
            . '<th style="border:1px solid #D9CFB8;">Цена</th>'
            . '<th style="border:1px solid #D9CFB8;">Кол-во</th>'
            . '<th style="border:1px solid #D9CFB8;">Сумма</th>'
            . '</tr>';
        foreach ($items as $item) {
            $title = trim((string) ($item['title'] ?? ''));
            $variant = trim((string) ($item['variant'] ?? ''));
            $price = (float) ($item['price'] ?? 0);
            $qty = (int) ($item['qty'] ?? 1);
            $total = (float) ($item['total'] ?? 0);
            $cell = h($title) . ($variant !== '' ? '<br><span style="color:#6b5f50;font-size:13px;">' . h($variant) . '</span>' : '');
            $h[] = '<tr>'
                . '<td style="border:1px solid #D9CFB8;">' . $cell . '</td>'
                . '<td style="border:1px solid #D9CFB8;">' . format_price($price) . ' ₽</td>'
                . '<td style="border:1px solid #D9CFB8;">' . $qty . '</td>'
                . '<td style="border:1px solid #D9CFB8;">' . format_price($total) . ' ₽</td>'
                . '</tr>';
        }
        $h[] = '</table>';
        $h[] = '<p style="margin:0 0 16px;font-size:17px;"><strong>Итого: '
            . format_price(items_total($items)) . ' ₽</strong></p>';
    }

    if ($page !== '') {
        $h[] = '<p style="margin:0;color:#6b5f50;font-size:13px;">Страница: ' . h($page) . '</p>';
    }

    $h[] = '</div>';
    return implode("\r\n", $h);
}

/** Экранирование HTML. */
function h($text)
{
    return htmlspecialchars((string) $text, ENT_QUOTES, 'UTF-8');
}

/** Число с неразрывным пробелом между разрядами — как на сайте. */
function format_price($value)
{
    return number_format((float) $value, 0, ',', chr(160));
}

/* ====================== Отправка ====================== */

/** Собирает MIME-письмо (multipart/alternative: текст + HTML). */
function build_mime($toEmail, $subject, $text, $html, $replyTo)
{
    global $config;

    $boundary = 'b' . bin2hex(random_bytes(12));
    $host = isset($_SERVER['HTTP_HOST'])
        ? preg_replace('/[^A-Za-z0-9\.\-]/', '', $_SERVER['HTTP_HOST'])
        : $config['site_domain'];

    $headers = array();
    $headers[] = 'Date: ' . date(DATE_RFC2822);
    $headers[] = 'From: ' . encode_name($config['mail_from_name']) . ' <' . $config['mail_from_ascii'] . '>';
    $headers[] = 'To: ' . encode_name($config['mail_to_name']) . ' <' . $toEmail . '>';
    $headers[] = 'Subject: ' . encode_subject($subject);
    $headers[] = 'Message-ID: <' . bin2hex(random_bytes(10)) . '@' . $host . '>';
    /* Reply-To имеет смысл только для e-mail: телефон из формы в Reply-To ломает письмо. */
    if (filter_var($replyTo, FILTER_VALIDATE_EMAIL)) {
        $headers[] = 'Reply-To: ' . $replyTo;
    }
    $headers[] = 'MIME-Version: 1.0';
    $headers[] = 'Content-Type: multipart/alternative; boundary="' . $boundary . '"';
    $headers[] = 'X-Mailer: SytoSite';

    $body = '--' . $boundary . "\r\n"
        . "Content-Type: text/plain; charset=UTF-8\r\n"
        . "Content-Transfer-Encoding: base64\r\n\r\n"
        . chunk_split(base64_encode($text), 76, "\r\n");
    $body .= '--' . $boundary . "\r\n"
        . "Content-Type: text/html; charset=UTF-8\r\n"
        . "Content-Transfer-Encoding: base64\r\n\r\n"
        . chunk_split(base64_encode($html), 76, "\r\n");
    $body .= '--' . $boundary . "--\r\n";

    return implode("\r\n", $headers) . "\r\n\r\n" . $body;
}

/** Отправка через SMTP-сервер хостинга (рекомендуемый способ). */
function smtp_send($toEmail, $subject, $text, $html, $replyTo)
{
    global $config;

    $transport = ($config['smtp_secure'] === 'ssl') ? 'ssl' : 'tcp';
    $errno = 0;
    $errstr = '';
    $socket = @stream_socket_client(
        $transport . '://' . $config['smtp_host'] . ':' . $config['smtp_port'],
        $errno,
        $errstr,
        20
    );

    if (!$socket) {
        throw new Exception('не удалось подключиться к SMTP (' . $errstr . ')');
    }

    stream_set_timeout($socket, 20);

    try {
        smtp_expect($socket, array(220), 'приветствие SMTP');
        smtp_expect($socket, array(250), 'EHLO', 'EHLO ' . $config['site_domain'] . "\r\n");

        if ($config['smtp_secure'] === 'tls') {
            smtp_expect($socket, array(220), 'STARTTLS', "STARTTLS\r\n");
            if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                throw new Exception('не удалось включить TLS');
            }
            smtp_expect($socket, array(250), 'EHLO после TLS', 'EHLO ' . $config['site_domain'] . "\r\n");
        }

        smtp_expect($socket, array(334), 'логин SMTP', "AUTH LOGIN\r\n");
        smtp_expect($socket, array(334), 'пароль SMTP', base64_encode($config['smtp_user']) . "\r\n");
        smtp_expect($socket, array(235), 'авторизация SMTP', base64_encode($config['smtp_pass']) . "\r\n");

        smtp_expect($socket, array(250), 'MAIL FROM', 'MAIL FROM:<' . $config['mail_from_ascii'] . ">\r\n");
        smtp_expect($socket, array(250), 'RCPT TO', 'RCPT TO:<' . $toEmail . ">\r\n");
        smtp_expect($socket, array(354), 'DATA', "DATA\r\n");

        smtp_expect($socket, array(250), 'отправка письма', smtp_dot_stuff(build_mime($toEmail, $subject, $text, $html, $replyTo)) . "\r\n.\r\n");
        smtp_expect($socket, array(221), 'завершение', "QUIT\r\n");
    } catch (Exception $e) {
        @fclose($socket);
        throw $e;
    }

    @fclose($socket);
}

/** Экранирует строки, начинающиеся с точки (SMTP DATA). */
function smtp_dot_stuff($text)
{
    $lines = explode("\r\n", $text);
    foreach ($lines as $i => $line) {
        if (strncmp($line, '.', 1) === 0) {
            $lines[$i] = '.' . $line;
        }
    }
    return implode("\r\n", $lines);
}

/** Ждёт ответа сервера и отправляет команду. */
function smtp_expect($socket, $codes, $context, $write = null)
{
    if ($write !== null) {
        fwrite($socket, $write);
    }
    $response = smtp_read($socket);
    foreach ($codes as $code) {
        if (strncmp($response, (string) $code, strlen((string) $code)) === 0) {
            return $response;
        }
    }
    throw new Exception('ошибка SMTP на шаге "' . $context . '": ' . $response);
}

/** Читает ответ сервера (может быть многострочным). */
function smtp_read($socket)
{
    $response = '';
    while (($line = fgets($socket, 515)) !== false) {
        $response .= $line;
        if (strlen($line) < 4 || $line[3] === ' ') {
            break;
        }
    }
    return trim($response);
}

/** Запасной способ отправки — встроенная функция mail() хостинга. */
function mail_send($toEmail, $subject, $text, $html, $replyTo)
{
    global $config;

    $mime = build_mime($toEmail, $subject, $text, $html, $replyTo);
    $split = strpos($mime, "\r\n\r\n");
    $head = substr($mime, 0, $split);
    $body = substr($mime, $split + 4);

    $headers = array();
    foreach (explode("\r\n", $head) as $line) {
        /* Тема в mail() передаётся отдельным аргументом. */
        if (stripos($line, 'Subject:') === 0) {
            continue;
        }
        $headers[] = $line;
    }

    $ok = @mail($toEmail, encode_subject($subject), $body, implode("\r\n", $headers), '-f' . $config['mail_from_ascii']);

    if (!$ok) {
        throw new Exception('функция mail() не сработала');
    }
}
