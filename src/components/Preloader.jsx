import { useEffect, useState } from 'react'

/**
 * Загрузочный экран — «штампуется печать ЭКОфермы».
 * Показывается при каждой загрузке страницы.
 *
 * Внутри — SVG-эмблема: круговая рамка + медовые соты + буква «С» в соте.
 * Анимация: контур рисуется через stroke-dasharray, буква появляется в финале.
 */
export default function Preloader() {
  const [state, setState] = useState('loading') // 'loading' | 'hiding' | 'hidden'

  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const hideTimer = setTimeout(() => {
      setState('hiding')
      document.body.style.overflow = prevOverflow
    }, 2000)

    const removeTimer = setTimeout(() => {
      setState('hidden')
    }, 2700)

    return () => {
      clearTimeout(hideTimer)
      clearTimeout(removeTimer)
      document.body.style.overflow = prevOverflow
    }
  }, [])

  if (state === 'hidden') return null

  // Большая центральная сота с буквой «С»
  const bigHex = [0, 60, 120, 180, 240, 300]
    .map((a) => {
      const ar = (a * Math.PI) / 180
      const r = 30
      return `${100 + r * Math.cos(ar)},${100 + r * Math.sin(ar)}`
    })
    .join(' ')

  return (
    <div className={`preloader preloader--${state}`} aria-hidden="true">
      <div className="preloader__seal">
        <svg
          className="preloader__emblem"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Внешний круг — обводка рисуется */}
          <circle
            cx="100"
            cy="100"
            r="92"
            className="emblem__ring emblem__ring--outer"
          />
          {/* Внутренний круг */}
          <circle
            cx="100"
            cy="100"
            r="72"
            className="emblem__ring emblem__ring--inner"
          />

          {/* Большая центральная сота с буквой «С» */}
          <polygon
            points={bigHex}
            className="emblem__hex"
          />
          <text
            x="100"
            y="115"
            textAnchor="middle"
            className="emblem__letter"
          >
            С
          </text>
        </svg>
      </div>
      <div className="preloader__title">СЫТО</div>
      <div className="preloader__caption">ЭКОферма · медовая лавка</div>
    </div>
  )
}
