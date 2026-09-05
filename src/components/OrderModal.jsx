import { useEffect, useMemo, useRef, useState } from 'react'

import { formatPrice } from '../data/index.js'

// Пороги скидок для напитков: количество → процент скидки.
// Менять тут, если в будущем логика изменится.
const NAPITOK_DISCOUNTS = [
    { minQty: 5, percent: 10 },
    { minQty: 3, percent: 5 },
]

/**
 * Считает скидку и итоговую стоимость для заданного количества.
 * Если товар — не напиток, скидка всегда 0.
 */
function calcTotals(unitPrice, quantity, isNapitok) {
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
function nextDiscountHint(qty, isNapitok) {
    if (!isNapitok) return null
    // Идём по порогам в обратном порядке: самый маленький «сверху»
    const upcoming = [...NAPITOK_DISCOUNTS]
        .reverse()
        .find((r) => qty < r.minQty)
    if (!upcoming) return null
    return { need: upcoming.minQty - qty, percent: upcoming.percent }
}

/**
 * Модалка с формой заявки. Без бэкенда — показывает «Спасибо».
 * Закрывается по Escape, клику на подложку и крестику.
 *
 * Доп. пропсы для подсчёта стоимости:
 * @param {number}  unitPrice        — цена за единицу товара
 * @param {boolean} isNapitok        — true, если товар из категории «Напитки»
 */
export default function OrderModal({
    isOpen,
    onClose,
    productTitle,
    variantLabel,
    unitPrice = 0,
    isNapitok = false,
}) {
    const [form, setForm] = useState({ name: '', phone: '' })
    const [quantity, setQuantity] = useState(1)
    const [status, setStatus] = useState('idle') // idle | success | error
    const firstInputRef = useRef(null)

    // Блокируем скролл, фокусируем первый инпут, вешаем Escape
    useEffect(() => {
        if (!isOpen) return

        function handleKeyDown(e) {
            if (e.key === 'Escape') onClose()
        }

        const prevOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        document.addEventListener('keydown', handleKeyDown)

        // Фокус на первое поле после открытия
        const t = setTimeout(() => {
            firstInputRef.current?.focus()
        }, 50)

        return () => {
            document.body.style.overflow = prevOverflow
            document.removeEventListener('keydown', handleKeyDown)
            clearTimeout(t)
        }
    }, [isOpen, onClose])

    // При каждом открытии сбрасываем количество и статус
    useEffect(() => {
        if (isOpen) {
            setQuantity(1)
            setStatus('idle')
        }
    }, [isOpen])

    const { qty, subtotal, percent, discount, total } = useMemo(
        () => calcTotals(unitPrice, quantity, isNapitok),
        [unitPrice, quantity, isNapitok]
    )
    const nextHint = useMemo(
        () => nextDiscountHint(qty, isNapitok),
        [qty, isNapitok]
    )

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    function incQty() {
        setQuantity((q) => Math.min(99, q + 1))
    }

    function decQty() {
        setQuantity((q) => Math.max(1, q - 1))
    }

    function handleQtyInput(e) {
        const v = e.target.value.replace(/\D/g, '')
        setQuantity(v === '' ? 1 : Math.min(99, Number(v)))
    }

    function handleSubmit(e) {
        e.preventDefault()
        if (!form.name.trim() || !form.phone.trim()) {
            setStatus('error')
            return
        }
        // Без бэкенда: позже можно подключить mailto: / WhatsApp / Formspree
        setStatus('success')
        setForm({ name: '', phone: '' })
    }

    function handleClose() {
        onClose()
        // Чуть позже сбрасываем state, чтобы не мигала старая подсветка
        setTimeout(() => setStatus('idle'), 200)
    }

    if (!isOpen) return null

    return (
        <div
            className="modal-backdrop"
            onClick={handleClose}
            role="presentation"
        >
            <div
                className="modal"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="order-modal-title"
            >
                <button
                    type="button"
                    className="modal__close"
                    onClick={handleClose}
                    aria-label="Закрыть"
                >
                    ×
                </button>

                <h2 id="order-modal-title" className="modal__title">
                    Заказать
                </h2>

                <p className="modal__product">
                    <span className="modal__product-name">{productTitle}</span>
                    {variantLabel && (
                        <span className="modal__product-variant">
                            {' '}
                            · {variantLabel}
                        </span>
                    )}
                </p>

                {status === 'success' ? (
                    <div className="modal__success">
                        <p className="form__notice form__notice--success">
                            Спасибо! Мы&nbsp;свяжемся с&nbsp;вами в&nbsp;ближайшее
                            время.
                        </p>
                        <button
                            type="button"
                            className="btn"
                            onClick={handleClose}
                        >
                            Закрыть
                        </button>
                    </div>
                ) : (
                    <form className="form" onSubmit={handleSubmit} noValidate>
                        {/* Счётчик количества */}
                        <div className="modal__qty">
                            <span className="modal__qty-label">Количество</span>
                            <div className="modal__qty-controls">
                                <button
                                    type="button"
                                    className="modal__qty-btn"
                                    onClick={decQty}
                                    disabled={qty <= 1}
                                    aria-label="Уменьшить количество"
                                >
                                    −
                                </button>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    className="modal__qty-input"
                                    value={qty}
                                    onChange={handleQtyInput}
                                    aria-label="Количество"
                                />
                                <button
                                    type="button"
                                    className="modal__qty-btn"
                                    onClick={incQty}
                                    disabled={qty >= 99}
                                    aria-label="Увеличить количество"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Расчёт стоимости */}
                        <div className="modal__summary">
                            <div className="modal__summary-row">
                                <span className="modal__summary-label">
                                    {formatPrice(unitPrice)}&nbsp;₽ × {qty}
                                </span>
                                <span className="modal__summary-value">
                                    {formatPrice(subtotal)}&nbsp;₽
                                </span>
                            </div>

                            {percent > 0 && (
                                <div className="modal__summary-row modal__summary-row--discount">
                                    <span className="modal__summary-label">
                                        Скидка {percent}%
                                    </span>
                                    <span className="modal__summary-value">
                                        −{formatPrice(discount)}&nbsp;₽
                                    </span>
                                </div>
                            )}

                            {nextHint && (
                                <p className="modal__discount-hint">
                                    Добавьте ещё {nextHint.need}&nbsp;
                                    {nextHint.need === 1
                                        ? 'штуку'
                                        : nextHint.need < 5
                                        ? 'штуки'
                                        : 'штук'}{' '}
                                    и&nbsp;получите скидку&nbsp;
                                    {nextHint.percent}%
                                </p>
                            )}

                            <div className="modal__summary-row modal__summary-row--total">
                                <span className="modal__summary-label">
                                    Итого
                                </span>
                                <span className="modal__summary-value">
                                    {formatPrice(total)}&nbsp;₽
                                </span>
                            </div>
                        </div>

                        <div className="form__field">
                            <label className="form__label" htmlFor="order-name">
                                Имя
                            </label>
                            <input
                                ref={firstInputRef}
                                className="form__input"
                                id="order-name"
                                name="name"
                                type="text"
                                autoComplete="given-name"
                                value={form.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form__field">
                            <label className="form__label" htmlFor="order-phone">
                                Телефон
                            </label>
                            <input
                                className="form__input"
                                id="order-phone"
                                name="phone"
                                type="tel"
                                autoComplete="tel"
                                placeholder="+7 ___ ___-__-__"
                                value={form.phone}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button type="submit" className="btn form__submit">
                            Отправить заявку
                        </button>

                        {status === 'error' && (
                            <p className="form__notice form__notice--error">
                                Пожалуйста, заполните оба поля.
                            </p>
                        )}
                    </form>
                )}
            </div>
        </div>
    )
}
