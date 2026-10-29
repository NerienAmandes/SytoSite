import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)

const STORAGE_KEY = 'syto-cart-v1'

// Пороги скидок для напитков: количество → процент скидки.
// Менять тут, если в будущем логика изменится.
export const NAPITOK_DISCOUNTS = [
    { minQty: 5, percent: 10 },
    { minQty: 3, percent: 5 },
]

/**
 * Считает скидку и итоговую стоимость для заданного количества.
 * Если товар — не напиток, скидка всегда 0.
 */
export function calcTotals(unitPrice, quantity, isNapitok) {
    const qty = Math.max(1, Number(quantity) || 1)
    const subtotal = unitPrice * qty
    const rule = isNapitok
        ? NAPITOK_DISCOUNTS.find((r) => qty >= r.minQty)
        : null
    const percent = rule ? rule.percent : 0
    const discount = Math.round((subtotal * percent) / 100)
    const total = subtotal - discount
    return { qty, subtotal, percent, discount, total }
}

/**
 * Следующий порог скидки, до которого осталось добрать.
 * null — следующего порога нет (или товар — не напиток).
 */
export function nextDiscountHint(qty, isNapitok) {
    if (!isNapitok) return null
    // Идём по порогам в обратном порядке: самый маленький «сверху»
    const upcoming = [...NAPITOK_DISCOUNTS]
        .reverse()
        .find((r) => qty < r.minQty)
    if (!upcoming) return null
    return { need: upcoming.minQty - qty, percent: upcoming.percent }
}

/** Уникальный ключ позиции: товар + конкретная фасовка. */
function makeKey(slug, variantLabel) {
    return `${slug}::${variantLabel || ''}`
}

function readStorage() {
    if (typeof window === 'undefined') return []
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        const parsed = raw ? JSON.parse(raw) : []
        return Array.isArray(parsed) ? parsed : []
    } catch {
        return []
    }
}

export function CartProvider({ children }) {
    const [items, setItems] = useState(readStorage)

    // Сохраняем в localStorage при любом изменении корзины
    useEffect(() => {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
        } catch {
            // Если хранилище недоступно — просто работаем без сохранения
        }
    }, [items])

    function addItem({ product, variantLabel, unitPrice, quantity = 1, isNapitok, image }) {
        const qty = Math.max(1, Number(quantity) || 1)
        const key = makeKey(product.slug, variantLabel)

        setItems((prev) => {
            const found = prev.find((i) => i.key === key)
            if (found) {
                return prev.map((i) =>
                    i.key === key ? { ...i, qty: i.qty + qty } : i
                )
            }
            return [
                ...prev,
                {
                    key,
                    slug: product.slug,
                    title: product.title,
                    variantLabel,
                    unitPrice,
                    qty,
                    isNapitok,
                    image: image || product.image || '',
                },
            ]
        })
    }

    function setQty(key, qty) {
        const value = Math.max(0, Math.min(99, Number(qty) || 0))
        setItems((prev) =>
            value === 0
                ? prev.filter((i) => i.key !== key)
                : prev.map((i) => (i.key === key ? { ...i, qty: value } : i))
        )
    }

    function increment(key) {
        setItems((prev) =>
            prev.map((i) =>
                i.key === key ? { ...i, qty: Math.min(99, i.qty + 1) } : i
            )
        )
    }

    function decrement(key) {
        setItems((prev) =>
            prev.flatMap((i) => {
                if (i.key !== key) return [i]
                if (i.qty <= 1) return []
                return [{ ...i, qty: i.qty - 1 }]
            })
        )
    }

    function removeItem(key) {
        setItems((prev) => prev.filter((i) => i.key !== key))
    }

    function clearCart() {
        setItems([])
    }

    const count = useMemo(
        () => items.reduce((sum, i) => sum + i.qty, 0),
        [items]
    )

    const totals = useMemo(() => {
        return items.reduce(
            (acc, i) => {
                const t = calcTotals(i.unitPrice, i.qty, i.isNapitok)
                acc.subtotal += t.subtotal
                acc.discount += t.discount
                acc.total += t.total
                return acc
            },
            { subtotal: 0, discount: 0, total: 0 }
        )
    }, [items])

    const value = useMemo(
        () => ({
            items,
            count,
            totals,
            addItem,
            setQty,
            increment,
            decrement,
            removeItem,
            clearCart,
        }),
        [items, count, totals]
    )

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
    const ctx = useContext(CartContext)
    if (!ctx) {
        throw new Error('useCart должен вызываться внутри <CartProvider>')
    }
    return ctx
}

export default CartContext