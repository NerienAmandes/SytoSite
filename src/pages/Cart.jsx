import { useState } from 'react'
import { Link } from 'react-router-dom'

import { useCart, calcTotals, nextDiscountHint } from '../context/CartContext.jsx'
import { formatPrice } from '../data/index.js'

export default function Cart() {
    const {
        items,
        count,
        totals,
        increment,
        decrement,
        setQty,
        removeItem,
        clearCart,
    } = useCart()

    const [form, setForm] = useState({ name: '', phone: '', comment: '', consent: false })
    const [status, setStatus] = useState('idle')
    const [errors, setErrors] = useState({})

    function handleChange(e) {
        const { name, type, checked, value } = e.target
        setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }))
    }

    function handleSubmit(e) {
        e.preventDefault()
        const newErrors = {}
        if (!form.name.trim()) newErrors.name = 'Укажите имя'
        if (!form.phone.trim()) newErrors.phone = 'Укажите телефон'
        if (!form.consent) newErrors.consent = 'Нужно ваше согласие'

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            setStatus('error')
            return
        }

        setStatus('success')
        clearCart()
    }

    if (items.length === 0 && status !== 'success') {
        return (
            <main className="container">
                <h1 className="page__title">Корзина</h1>
                <p className="page__empty">
                    Ваша корзина пуста.
                </p>
                <div className="page__actions">
                    <Link to="/catalog" className="btn">
                        В каталог
                    </Link>
                </div>
            </main>
        )
    }

    if (status === 'success') {
        return (
            <main className="container">
                <h1 className="page__title">Спасибо!</h1>
                <p className="page__empty">
                    Мы&nbsp;свяжемся с&nbsp;вами в&nbsp;ближайшее время и&nbsp;подтвердим заказ.
                </p>
                <div className="page__actions">
                    <Link to="/catalog" className="btn">
                        Вернуться в каталог
                    </Link>
                </div>
            </main>
        )
    }

    return (
        <main className="container">
            <h1 className="page__title">Корзина</h1>

            <div className="cart">
                <div className="cart__items">
                    {items.map((item) => {
                        const t = calcTotals(item.unitPrice, item.qty, item.isNapitok)
                        const hint = nextDiscountHint(item.qty, item.isNapitok)

                        return (
                            <div key={item.key} className="cart-item">
                                <div className="cart-item__media">
                                    {item.image && (
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="cart-item__image"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    )}
                                </div>

                                <div className="cart-item__body">
                                    <Link to={`/product/${item.slug}`} className="cart-item__title">
                                        {item.title}
                                    </Link>
                                    {item.variantLabel && (
                                        <span className="cart-item__variant">{item.variantLabel}</span>
                                    )}

                                    <div className="cart-item__controls">
                                        <div className="cart-item__qty">
                                            <button
                                                type="button"
                                                className="cart-item__qty-btn"
                                                onClick={() => decrement(item.key)}
                                                aria-label="Уменьшить количество"
                                            >
                                                −
                                            </button>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                className="cart-item__qty-input"
                                                value={item.qty}
                                                onChange={(e) => {
                                                    const v = e.target.value.replace(/\D/g, '')
                                                    setQty(item.key, v === '' ? 0 : Number(v))
                                                }}
                                                aria-label="Количество"
                                            />
                                            <button
                                                type="button"
                                                className="cart-item__qty-btn"
                                                onClick={() => increment(item.key)}
                                                disabled={item.qty >= 99}
                                                aria-label="Увеличить количество"
                                            >
                                                +
                                            </button>
                                        </div>

                                        <button
                                            type="button"
                                            className="cart-item__remove"
                                            onClick={() => removeItem(item.key)}
                                        >
                                            Удалить
                                        </button>
                                    </div>

                                    {hint && (
                                        <p className="cart-item__discount-hint">
                                            Добавьте ещё {hint.need} шт. и&nbsp;получите скидку&nbsp;{hint.percent}%
                                        </p>
                                    )}
                                </div>

                                <div className="cart-item__price">
                                    <div className="cart-item__price-row">
                                        <span>{formatPrice(item.unitPrice)} ₽ × {t.qty}</span>
                                        <span>{formatPrice(t.subtotal)} ₽</span>
                                    </div>
                                    {t.discount > 0 && (
                                        <div className="cart-item__price-row cart-item__price-row--discount">
                                            <span>Скидка {t.percent}%</span>
                                            <span>−{formatPrice(t.discount)} ₽</span>
                                        </div>
                                    )}
                                    <div className="cart-item__price-total">{formatPrice(t.total)} ₽</div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <aside className="cart__summary">
                    <div className="modal__summary">
                        <div className="modal__summary-row">
                            <span className="modal__summary-label">
                                Товаров: {count}
                            </span>
                            <span className="modal__summary-value">
                                {formatPrice(totals.subtotal)} ₽
                            </span>
                        </div>

                        {totals.discount > 0 && (
                            <div className="modal__summary-row modal__summary-row--discount">
                                <span className="modal__summary-label">
                                    Скидка
                                </span>
                                <span className="modal__summary-value">
                                    −{formatPrice(totals.discount)} ₽
                                </span>
                            </div>
                        )}

                        <div className="modal__summary-row modal__summary-row--total">
                            <span className="modal__summary-label">Итого</span>
                            <span className="modal__summary-value">
                                {formatPrice(totals.total)} ₽
                            </span>
                        </div>
                    </div>

                    <form className="form" onSubmit={handleSubmit} noValidate>
                        <div className="form__field">
                            <label className="form__label" htmlFor="cart-name">
                                Имя <span className="form__required">*</span>
                            </label>
                            <input
                                className={'form__input' + (errors.name ? ' form__input--error' : '')}
                                id="cart-name"
                                name="name"
                                type="text"
                                autoComplete="given-name"
                                value={form.name}
                                onChange={handleChange}
 />
                            {errors.name && <span className="form__error">{errors.name}</span>}
                        </div>

                        <div className="form__field">
                            <label className="form__label" htmlFor="cart-phone">
                                Телефон <span className="form__required">*</span>
                            </label>
                            <input
                                className={'form__input' + (errors.phone ? ' form__input--error' : '')}
                                id="cart-phone"
                                name="phone"
                                type="tel"
                                autoComplete="tel"
                                placeholder="+7 ___ ___-__-__"
                                value={form.phone}
                                onChange={handleChange}
                            />
                            {errors.phone && <span className="form__error">{errors.phone}</span>}
                        </div>

                        <div className="form__field">
                            <label className="form__label" htmlFor="cart-comment">
                                Комментарий
                            </label>
                            <textarea
                                className="form__input form__textarea"
                                id="cart-comment"
                                name="comment"
                                value={form.comment}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form__field form__field--checkbox">
                            <label className="form__check">
                                <input
                                    type="checkbox"
                                    name="consent"
                                    checked={form.consent}
                                    onChange={handleChange}
                                    className="form__check-input"
                                />
                                <span className="form__check-box" aria-hidden="true" />
                                <span className="form__check-text">
                                    Согласен с&nbsp;<a href="#privacy">обработкой персональных данных</a>
                                </span>
                            </label>
                            {errors.consent && <span className="form__error">{errors.consent}</span>}
                        </div>

                        <button type="submit" className="btn form__submit">
                            Отправить заказ
                        </button>
                    </form>

                    <button type="button" className="cart__clear" onClick={clearCart}>
                        Очистить корзину
                    </button>
                </aside>
            </div>
        </main>
    )
}
