import { useParams, Link } from 'react-router-dom'
import { products, categories } from '../data/index.js'
import Card from '../components/Card.jsx'
import Divider from '../components/Divider.jsx'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import useSeo from '../hooks/useSeo.js'

export default function Category() {
  // Достаём slug из адреса: /catalog/napitki → "napitki"
  const { categorySlug } = useParams()

  const category = categories.find((c) => c.slug === categorySlug)
  const categoryProducts = products.filter((p) => p.category === categorySlug)

  useSeo({
    title: category ? category.title : 'Категория не найдена',
    description: category
      ? `${category.title} от ЭКОфермы «Сыто». ${category.shortDescription || ''} Натуральные продукты с доставкой по России.`
      : 'Запрошенная категория не найдена в каталоге ЭКОфермы «Сыто».',
  })

  if (!category) {
    return (
      <main className="container">
        <Breadcrumbs
          items={[
            { label: 'Главная', to: '/' },
            { label: 'Каталог', to: '/catalog' },
            { label: 'Не найдено' },
          ]}
        />
        <h1 className="page__title">Категория не найдена</h1>
        <Divider />
        <p className="page__empty">
          Похоже, такой страницы в нашей лавке нет.
        </p>
        <div className="page__actions">
          <Link to="/catalog" className="btn">В каталог</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="container">
      <Breadcrumbs
        items={[
          { label: 'Главная', to: '/' },
          { label: 'Каталог', to: '/catalog' },
          { label: category.title },
        ]}
      />

      <h1 className="page__title">{category.title}</h1>
      <Divider />

      {category.shortDescription && (
        <p className="page__intro">{category.shortDescription}</p>
      )}

      {categorySlug === 'napitki' && (
        <aside className="discount-banner" role="note">
          <span className="discount-banner__icon" aria-hidden="true">✦</span>
          <div className="discount-banner__text">
            <strong>Скидки при заказе напитков:</strong>{' '}
            от&nbsp;3&nbsp;штук&nbsp;— скидка&nbsp;5%, от&nbsp;5&nbsp;штук&nbsp;— скидка&nbsp;10%.
            Скидка считается автоматически при оформлении заказа.
          </div>
        </aside>
      )}

      {categoryProducts.length === 0 ? (
        <p className="page__empty">В этой категории пока нет товаров.</p>
      ) : (
        <div className="cards-grid">
          {categoryProducts.map((product) => (
            <Card key={product.slug} product={product} />
          ))}
        </div>
      )}
    </main>
  )
}
