/**
 * Отправка заявок и заказов на сервер.
 *
 * На хостинге sweb.ru рядом с index.html лежит PHP-обработчик send-order.php —
 * он принимает JSON, формирует письмо и отправляет его на почту.
 */
const ENDPOINT = `${import.meta.env.BASE_URL}send-order.php`

/**
 * @param {object} payload — { type, name, phone, comment, items[], total, page, website }
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function sendOrder(payload) {
    try {
        const response = await fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })

        const data = await response.json().catch(() => null)

        if (!response.ok || !data || data.ok !== true) {
            return {
                ok: false,
                error: data?.error || 'Сервер не принял заявку',
            }
        }

        return { ok: true }
    } catch {
        return {
            ok: false,
            error: 'Не удалось связаться с сервером',
        }
    }
}

export default sendOrder
