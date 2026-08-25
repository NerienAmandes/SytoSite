import { Link } from 'react-router-dom'

/**
 * Хлебные крошки. Последний элемент — текущая страница (без ссылки).
 *
 * @param {Array<{label: string, to?: string}>} items
 */
export default function Breadcrumbs({ items = [] }) {
  if (items.length === 0) return null

  return (
    <nav className="breadcrumbs" aria-label="Хлебные крошки">
      <ol className="breadcrumbs__list">
        {items.map((item, i) => {
          const isLast = i === items.length - 1
          return (
            <li key={i} className="breadcrumbs__item">
              {item.to && !isLast ? (
                <Link to={item.to} className="breadcrumbs__link">
                  {item.label}
                </Link>
              ) : (
                <span className="breadcrumbs__current" aria-current="page">
                  {item.label}
                </span>
              )}
              {!isLast && (
                <span className="breadcrumbs__sep" aria-hidden="true">
                  ›
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
