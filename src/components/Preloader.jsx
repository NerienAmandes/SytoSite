import { useEffect, useState } from 'react'

/**
 * Загрузочный экран — «штампуется печать ЭКОфермы».
 * Показывается при каждой загрузке страницы.
 *
 * Внутри — SVG-эмблема и надпись СЫТО,
 * украшенная символами Исток с обеих сторон.
 */

export default function Preloader() {
  const [state, setState] = useState('loading')

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
          viewBox="-15 -15 230 230"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Волнистое солнце по референсу */}
          <image
            href="/images/solntse-volnistoe.svg"
            x="-15"
            y="-15"
            width="230"
            height="230"
            preserveAspectRatio="xMidYMid meet"
          />

          {/* Буква С */}
          <text
            x="100"
            y="100"
            textAnchor="middle"
            dominantBaseline="central"
            className="emblem__letter"
            style={{
              fontFamily: 'var(--font-ponomar)',
              fontSize: '60px',
              fill: '#000000',
              stroke: '#000000',
              strokeWidth: '1.8px',
              paintOrder: 'stroke fill',
            }}
          >
            С
          </text>
        </svg>
      </div>

      {/* СИМВОЛ — СЫТО — СИМВОЛ */}
      <div className="preloader__title-wrap">

        <img
          src="../public/images/znak.png"
          className="preloader__istok--left"
          alt=""
        />

        <div
          className="preloader__title"
          style={{
            fontFamily: 'var(--font-ponomar)',
            fontWeight: 700,
            fontSize: '2.4rem',
            letterSpacing: '0.18em',
            WebkitTextStroke: '0.7px currentColor',
          }}
        >
          СЫТО
        </div>

        <img
          src="../public/images/znak.png"
          className="preloader__istok--right"
          alt=""
        />

      </div>

      {/* Подпись */}
      <div
        className="preloader__caption"
        style={{
          fontSize: '1rem',
          fontWeight: 600,
          letterSpacing: '0.09em',
          color: 'var(--color-text)',
          opacity: 0.9,
        }}
      >
        Исконно наше · родное
      </div>

    </div>
  )
}