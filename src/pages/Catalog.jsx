import { Link } from 'react-router-dom'
import { categories, categoryStyle } from '../data/index.js'
import Divider from '../components/Divider.jsx'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import useSeo from '../hooks/useSeo.js'

export default function Catalog() {
  useSeo({
    title: 'Каталог продукции',
    description:
      'Дары заповедных лесов и лугов — мёд, травы и мясные деликатесы собственного производства ЭКОфермы «Сыто».',
  })

  return (
    <main className="container">
      <Breadcrumbs
        items={[
          { label: 'Главная', to: '/' },
          { label: 'Каталог' },
        ]}
      />

      <h1 className="page__title">Каталог продукции</h1>
      <Divider />
      <p className="page__intro">
        Дары заповедных лесов и лугов — мёд, травы и мясные деликатесы
        собственного производства.
      </p>

      {categories.length === 0 ? (
        <p className="page__empty">Категории пока не добавлены.</p>
      ) : (
        <div className="cards-grid cards-grid--wide">
          {categories.map((category) => {
            const style = categoryStyle(category.slug)
            return (
              <Link
                key={category.slug}
                to={`/catalog/${category.slug}`}
                className="card category-card"
              >
                <div
                  className="category-card__media"
                  style={{ backgroundColor: style.tint }}
                  aria-hidden="true"
                >
                  <span className="category-card__glyph">{style.glyph}</span>
                </div>
                <h2 className="category-card__title">{category.title}</h2>
                {category.shortDescription && (
                  <p className="category-card__text">
                    {category.shortDescription}
                  </p>
                )}
                <span className="category-card__cta">Смотреть товары →</span>
              </Link>
            )
          })}
        </div>
      )}
    </main>
  )
}
