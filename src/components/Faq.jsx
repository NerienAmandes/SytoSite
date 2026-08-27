import { useState } from 'react'

import { faq as defaultFaq } from '../data/index.js'

/**
 * Аккордеон FAQ.
 * По умолчанию раскрыт первый вопрос (если defaultOpenIndex не задан).
 *
 * Props:
 *  - items: [{ id, question, answer }] — если не передано, берём из data/index.js
 *  - defaultOpenIndex: number — какой вопрос открыт изначально
 *  - allowMultiple: bool — если true, можно открыть несколько сразу
 */
export default function Faq({
  items = defaultFaq,
  defaultOpenIndex = 0,
  allowMultiple = false,
}) {
  const [openSet, setOpenSet] = useState(() => {
    const s = new Set()
    if (!allowMultiple && defaultOpenIndex >= 0 && items[defaultOpenIndex]) {
      s.add(items[defaultOpenIndex].id)
    }
    return s
  })

  if (!items || items.length === 0) return null

  function toggle(id) {
    setOpenSet((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        if (!allowMultiple) next.clear()
        next.add(id)
      }
      return next
    })
  }

  return (
    <ul className="faq" role="list">
      {items.map((item) => {
        const isOpen = openSet.has(item.id)
        const panelId = `faq-panel-${item.id}`
        const btnId = `faq-btn-${item.id}`
        return (
          <li
            key={item.id}
            className={'faq__item' + (isOpen ? ' faq__item--open' : '')}
          >
            <button
              id={btnId}
              type="button"
              className="faq__question"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(item.id)}
            >
              <span className="faq__question-text">{item.question}</span>
              <span className="faq__icon" aria-hidden="true">
                {isOpen ? '−' : '+'}
              </span>
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={btnId}
              className="faq__answer"
            >
              <div className="faq__answer-inner">
                <p>{item.answer}</p>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
