import { useState } from 'react'

import { sendOrder } from '../api/sendOrder.js'

/**
 * Общая форма заявки для сайта.
 * Поля: имя, телефон, комментарий, согласие на обработку персональных данных.
 *
 * @param {string}  [submitLabel]    — текст кнопки
 * @param {string}  [successMessage] — сообщение после успешной отправки
 * @param {string}  [className]     — дополнительные классы корневой формы
 */
export default function RequestForm({
  submitLabel = 'Отправить заявку',
  successMessage = 'Спасибо! Мы свяжемся с вами в ближайшее время.',
  className = '',
}) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    comment: '',
    consent: false,
    website: '',
  })
  const [status, setStatus] = useState('idle') // idle | success | error
  const [errors, setErrors] = useState({})
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')

  function handleChange(e) {
    const { name, type, checked, value } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  async function handleSubmit(e) {
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

    setSending(true)
    setSendError('')

    const result = await sendOrder({
      type: 'request',
      name: form.name.trim(),
      phone: form.phone.trim(),
      comment: form.comment.trim(),
      website: form.website,
      page: window.location.href,
    })

    setSending(false)

    if (!result.ok) {
      setStatus('error')
      setSendError(result.error)
      return
    }

    setStatus('success')
    setForm({ name: '', phone: '', comment: '', consent: false, website: '' })
  }

  if (status === 'success') {
    return (
      <div className={`form form--success ${className}`}>
        <p className="form__notice form__notice--success">{successMessage}</p>
      </div>
    )
  }

  return (
    <form
      className={`form ${className}`}
      onSubmit={handleSubmit}
      noValidate
    >
      {/* Ловушка для ботов: поле скрыто от людей */}
      <input
        className="form__hp"
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        value={form.website}
        onChange={handleChange}
        aria-hidden="true"
      />

      <div className="form__field">
        <label className="form__label" htmlFor="req-name">
          Имя <span className="form__required" aria-hidden="true">*</span>
        </label>
        <input
          className={
            'form__input' + (errors.name ? ' form__input--error' : '')
          }
          id="req-name"
          name="name"
          type="text"
          autoComplete="given-name"
          value={form.name}
          onChange={handleChange}
          aria-invalid={Boolean(errors.name)}
          required
        />
        {errors.name && <span className="form__error">{errors.name}</span>}
      </div>

      <div className="form__field">
        <label className="form__label" htmlFor="req-phone">
          Телефон <span className="form__required" aria-hidden="true">*</span>
        </label>
        <input
          className={
            'form__input' + (errors.phone ? ' form__input--error' : '')
          }
          id="req-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+7 ___ ___-__-__"
          value={form.phone}
          onChange={handleChange}
          aria-invalid={Boolean(errors.phone)}
          required
        />
        {errors.phone && <span className="form__error">{errors.phone}</span>}
      </div>

      <div className="form__field">
        <label className="form__label" htmlFor="req-comment">
          Комментарий
        </label>
        <textarea
          className="form__input form__textarea"
          id="req-comment"
          name="comment"
          rows={4}
          placeholder="Что вас интересует? Удобное время для звонка…"
          value={form.comment}
          onChange={handleChange}
        />
      </div>

      <div className="form__field form__field--checkbox">
        <label className="form__check">
          <input
            type="checkbox"
            name="consent"
            className="form__check-input"
            checked={form.consent}
            onChange={handleChange}
            aria-invalid={Boolean(errors.consent)}
            required
          />
          <span className="form__check-box" aria-hidden="true" />
          <span className="form__check-text">
            Согласен на&nbsp;обработку персональных данных в&nbsp;соответствии
            с&nbsp;<a href="#privacy" className="form__check-link">политикой конфиденциальности</a>
          </span>
        </label>
        {errors.consent && <span className="form__error">{errors.consent}</span>}
      </div>

      <button type="submit" className="btn form__submit" disabled={sending}>
        {sending ? 'Отправляем…' : submitLabel}
      </button>

      {sendError && (
        <p className="form__notice form__notice--error">
          {sendError}. Позвоните нам: +7 (903) 238-70-62
        </p>
      )}

      {status === 'error' && Object.keys(errors).length === 0 && (
        <p className="form__notice form__notice--error">
          Проверьте правильность заполнения полей.
        </p>
      )}
    </form>
  )
}
