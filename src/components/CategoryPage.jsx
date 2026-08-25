import { useState } from 'react'

import Card from './Card.jsx'
import Divider from './Divider.jsx'

/**
 * Общая обёртка для страниц категорий.
 * Сама ничего не знает о категориях — данные приходят снаружи.
 *
 * @param {object}   category      — запись из categories.json
 * @param {object[]} products      — массив товаров, уже отфильтрованный по category.slug
 * @param {boolean}  showFilters   — показать ли панель фильтров
 * @param {Array<{value,label}>}  filters — конфиг кнопок фильтра
 */
export default function CategoryPage({
  category,
  products = [],
  showFilters = false,
  filters = [],
}) {
  const [activeFilter, setActiveFilter] = useState('all')

  const visible =
    showFilters && activeFilter !== 'all'
      ? products.filter((p) => p.tags.includes(activeFilter))
      : products

  if (!category) {
    return (
      <main className="container">
        <h1 className="page__title">Категория не найдена</h1>
        <Divider />
      </main>
    )
  }

  return (
    <main className="container">
      <h1 className="page__title">{category.title}</h1>
      <Divider />

      {category.shortDescription && (
        <p className="page__intro">{category.shortDescription}</p>
      )}

      {showFilters && filters.length > 0 && (
        <div
          className="filters"
          role="group"
          aria-label="Фильтр товаров"
        >
          {filters.map((f) => {
            const isActive = activeFilter === f.value
            return (
              <button
                key={f.value}
                type="button"
                className={
                  'filters__btn' +
                  (isActive ? ' filters__btn--active' : '')
                }
                onClick={() => setActiveFilter(f.value)}
                aria-pressed={isActive}
              >
                {f.label}
              </button>
            )
          })}
        </div>
      )}

      {visible.length > 0 ? (
        <div className="cards-grid">
          {visible.map((p) => {
            const minPrice = Math.min(...p.variants.map((v) => v.price))
            return (
              <Card
                key={p.slug}
                to={`/product/${p.slug}`}
                title={p.title}
              >
                <p className="card__text">{p.shortDescription}</p>
                <div className="card__footer">
                  <span className="card__price">от {minPrice} ₽</span>
                  <span className="btn">Подробнее</span>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <p className="page__empty">
          В этой категории пока нет товаров по выбранному фильтру.
        </p>
      )}
    </main>
  )
}
