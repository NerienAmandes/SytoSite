import { useEffect } from 'react'

/**
 * Хук для SEO на клиентских маршрутах.
 * Устанавливает <title> и meta[name="description"] при монтировании компонента,
 * а также Open Graph-теги (og:title, og:description) для красивых превью в соцсетях.
 *
 * Для статической сборки на sweb.ru этого достаточно:
 * краулеры видят актуальный title после рендера, а description
 * в index.html остаётся дефолтным для главной.
 */
export default function useSeo({ title, description, canonical }) {
  useEffect(() => {
    // Title страницы
    const fullTitle = title
      ? `${title} — Сыто | ЭКОферма Дмитрия Колистратова`
      : 'Сыто — ЭКОферма Дмитрия Колистратова'
    document.title = fullTitle

    // Description
    if (description) {
      setMeta('description', description)
      setMeta('og:description', description, 'property')
    }

    // OG title
    setMeta('og:title', fullTitle, 'property')

    // Canonical — если не задан, используем текущий URL
    const url = canonical || (typeof window !== 'undefined' ? window.location.href : '')
    if (url) {
      setLink('canonical', url)
      setMeta('og:url', url, 'property')
    }
  }, [title, description, canonical])
}

function setMeta(name, content, attr = 'name') {
  let el = document.head.querySelector(`meta[${attr}="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}
