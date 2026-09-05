import productsJson from './products.json'
import categoriesJson from './categories.json'
import faqJson from './faq.json'

// Защищаемся: работает и с массивом, и с объектом { products: [...] }
export const products = Array.isArray(productsJson)
    ? productsJson
    : productsJson.products || []

export const categories = Array.isArray(categoriesJson)
    ? categoriesJson
    : categoriesJson.categories || []

export const faq = Array.isArray(faqJson)
    ? faqJson
    : faqJson.items || []

// --- Плейсхолдеры: эмодзи + цветовая плашка по слагу категории ---
const CATEGORY_STYLES = {
    napitki: { glyph: '🍯', tint: '#F0D899', label: 'Напиток' },
    myod: { glyph: '🍯', tint: '#E8B23A', label: 'Мёд' },
    'myasnye-delikatesy': { glyph: '🍖', tint: '#C76B6B', label: 'Деликатес' },
    gidrolaty: { glyph: '🌿', tint: '#A8C97A', label: 'Гидролат' },
}

export function categoryStyle(slug) {
    return CATEGORY_STYLES[slug] || { glyph: '✦', tint: '#D49A36', label: '' }
}

// --- Цена: минимальная из вариантов, форматированная строкой ---
export function minPriceOf(product) {
    const prices = (product?.variants || [])
        .map((v) => Number(v.price))
        .filter((n) => Number.isFinite(n))
    return prices.length ? Math.min(...prices) : null
}

export function formatPrice(n) {
    if (n == null) return ''
    // 1500 -> "1 500", чтобы читалось по-купечески
    return n.toLocaleString('ru-RU')
}

// --- Поиск по товарам: title, tags, shortDescription, description ---
// Нормализуем строку (lowercase, без ё/е разницы) и проверяем вхождение подстроки
function normalize(s) {
    return (s || '')
        .toString()
        .toLowerCase()
        .replace(/ё/g, 'е')
}

export function searchProducts(query, limit) {
    const q = normalize(query).trim()
    if (!q) return []
    const matches = products.filter((p) => {
        const haystack = [
            p.title,
            p.shortDescription,
            p.description,
            ...(p.tags || []),
        ]
            .map(normalize)
            .join(' | ')
        return haystack.includes(q)
    })
    return typeof limit === 'number' ? matches.slice(0, limit) : []
}

// --- Размеры изображений (для width/height в <img> чтобы не было сдвига макета) ---
// Ключ — имя файла без расширения. Актуальные значения берутся из
// scripts/inspect-webp.mjs. Если файла нет в мапе — вернётся null и браузер
// пропустит атрибут (полагаемся на aspect-ratio в CSS как подстраховку).
const IMAGE_DIMS = {
    siten: { w: 622, h: 624 },
    'СЫТА': { w: 1200, h: 960 },
    svetlayasita: { w: 1200, h: 960 },
    temnayasita: { w: 1200, h: 960 },
    nalivka: { w: 612, h: 604 },
    uksus: { w: 1024, h: 768 },
    rose: { w: 622, h: 614 },
    krapiva: { w: 620, h: 616 },
    siren: { w: 620, h: 620 },
    ivanchai: { w: 620, h: 622 },
    ytka: { w: 1200, h: 801 },
    indeika: { w: 1200, h: 800 },
    indeikabedro: { w: 1200, h: 900 },
    balik: { w: 1200, h: 900 },
    kapokollo: { w: 1200, h: 675 },
    pancetta: { w: 1122, h: 1402 },
    baranina: { w: 1200, h: 960 },
    kolbasa: { w: 1128, h: 1394 },
    grydinka: { w: 1200, h: 960 },
    okorok: { w: 1122, h: 1402 },
    sessina: { w: 1023, h: 1537 },
    sheiasvinaya: { w: 1200, h: 1200 },
    goviadinamedovaya: { w: 1200, h: 800 },
    gus: { w: 1200, h: 900 },
    karpaccokura: { w: 1122, h: 1402 },
    kyrochka: { w: 1086, h: 1448 },
    olen: { w: 1122, h: 1402 },
    pryaniiposol: { w: 1122, h: 1402 },
    salo: { w: 1200, h: 900 },
    salobochka: { w: 1122, h: 1402 },
    salovengerski: { w: 1086, h: 1448 },
    ytkakarpacco: { w: 1122, h: 1402 },
    'syto-napintki': { w: 1200, h: 669 },
    myaso: { w: 1200, h: 800 },
    hydro: { w: 1200, h: 800 },
    // Добавлено при подключении файлов из public/images/ (см. scripts/wire-images.mjs)
    arzamasgus: { w: 1086, h: 1448 },
    kipreichaiferment: { w: 1086, h: 1448 },
    kiprejsmalinoy: { w: 1086, h: 1448 },
    kvas: { w: 1024, h: 1536 },
    ognevka: { w: 1086, h: 1448 },
    uzvarnoldvapuat: { w: 1086, h: 1448 },
    myod: { w: 1024, h: 559 },
    // Добавлено во второй итерации (scripts/wire-images-2.mjs)
    siria: { w: 1086, h: 1448 },
    mnogasit: { w: 1200, h: 960 },
    sitokakoeto: { w: 1024, h: 1536 },
    sirovyalen: { w: 1086, h: 1448 },
    sitaplastik: { w: 1086, h: 1448 },
    uzvarnolpuat: { w: 1086, h: 1448 },
    uzvarnolsemdpuat: { w: 1086, h: 1448 },
}

export function imageDims(imagePath) {
    if (!imagePath) return null
    // /images/СЫТА.webp → СЫТА
    const base = imagePath.split('/').pop().replace(/\.[^.]+$/, '')
    return IMAGE_DIMS[base] || null
}
