import { useEffect, useRef, useState } from 'react'

/**
 * Модалка с формой заявки. Без бэкенда — показывает «Спасибо».
 * Закрывается по Escape, клику на подложку и крестику.
 *
 * @param {boolean}  isOpen
 * @param {Function} onClose
 * @param {string}   productTitle
 * @param {string}   [variantLabel] — выбранная фасовка, если есть
 */
export default function OrderModal({
  isOpen,
  onClose,
  productTitle,
  variantLabel,
}) {
  const [form, setForm] = useState({ name: '', phone: '' })
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

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
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
            <span className="modal__product-variant"> · {variantLabel}</span>
          )}
        </p>

        {status === 'success' ? (
          <div className="modal__success">
            <p className="form__notice form__notice--success">
              Спасибо! Мы&nbsp;свяжемся с&nbsp;вами в&nbsp;ближайшее время.
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
