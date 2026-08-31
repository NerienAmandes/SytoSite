import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'

import { products, categories, imageDims } from '../data/index.js'
import { formatPrice } from '../data/index.js'

import Card from '../components/Card.jsx'
import Divider from '../components/Divider.jsx'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import OrderModal from '../components/OrderModal.jsx'
import ImageZoom from '../components/ImageZoom.jsx'
import useSeo from '../hooks/useSeo.js'

const RELATED_COUNT = 4

export default function Product() {
  const { slug } = useParams()
  const product = products.find((p) => p.slug === slug)

  useSeo({
    title: product ? product.title : 'Товар не найден',
    description: product
      ? `${product.title} от ЭКОфермы «Сыто». ${product.shortDescription || ''} Натуральные продукты с доставкой по России.`.slice(0, 200)
      : 'Запрошенный товар не найден в каталоге ЭКОфермы «Сыто».',
  })

  if (!product) {
    return (
      <main className="container">
        <Breadcrumbs
          items={[
            { label: 'Главная', to: '/' },
            { label: 'Каталог', to: '/catalog' },
            { label: 'Товар не найден' },
          ]}
        />
        <h1 className="page__title">Товар не найден</h1>
        <Divider />
        <p className="page__empty">
          Возможно, ссылка устарела или товар снят с&nbsp;продажи.
        </p>
        <div className="page__actions">
          <Link to="/catalog" className="btn">В каталог</Link>
        </div>
      </main>
    )
  }

  const category = categories.find((c) => c.slug === product.category)

  // Похожие: та же категория, без текущего, первые N
  const related = products
    .filter(
      (p) => p.category === product.category && p.slug !== product.slug
    )
    .slice(0, RELATED_COUNT)
    .sort((a, b) => {
      // Сортировка для гидролатов, чтобы они всегда шли в одном порядке
      if (a.category === 'gidrolaty' && b.category === 'gidrolaty') {
        const order = [
          'gidro-lat-belaya-roza',
          'gidro-lat-krapiva',
          'gidro-lat-ivan-chay',
          'gidro-lat-siren'
        ];
        return order.indexOf(a.slug) - order.indexOf(b.slug);
      }
      return 0;
    });

  return (
    <ProductView
      product={product}
      category={category}
      related={related}
    />
  )
}

function ProductView({ product, category, related }) {
  const [selectedVariant, setSelectedVariant] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isZoomOpen, setIsZoomOpen] = useState(false)

  const currentVariant = product.variants[selectedVariant] || product.variants[0]

  /* Сборка хлебных крошек из данных, без хардкода названий */
  const crumbs = [
    { label: 'Главная', to: '/' },
    { label: 'Каталог', to: '/catalog' },
  ]
  if (category) {
    crumbs.push({
      label: category.title,
      to: `/catalog/${category.slug}`,
    })
  }
  crumbs.push({ label: product.title })

  return (
    <main className="container">
      <Breadcrumbs items={crumbs} />

      <div className="product">
        {/* ----- Медиа ----- */}
        <div className="product__media">
          {product.image ? (
            <img
              src={product.image}
              alt={product.title}
              className="product__image"
              loading="lazy"
              decoding="async"
              width={imageDims(product.image)?.w}
              height={imageDims(product.image)?.h}
              style={product.imageSprite ? { objectPosition: product.imageSprite, objectFit: 'cover' } : {}}
              onClick={() => setIsZoomOpen(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setIsZoomOpen(true)
                }
              }}
            />
          ) : (
            <div className="product__image-placeholder" aria-hidden="true">
              <span className="product__placeholder-glyph">❦</span>
            </div>
          )}
        </div>

        {/* ----- Информация ----- */}
        <div className="product__info">
          <h1 className="product__title">{product.title}</h1>
          <Divider />

          <p className="product__short">{product.shortDescription}</p>

          {product.variants.length > 0 && (
            <div className="product__variants">
              <h3 className="product__variants-title">Фасовка</h3>
              <div
                className="product__variant-list"
                role="radiogroup"
                aria-label="Выбор фасовки"
              >
                {product.variants.map((v, i) => {
                  const isActive = i === selectedVariant
                  return (
                    <button
                      key={i}
                      type="button"
                      role="radio"
                      aria-checked={isActive}
                      className={
                        'product__variant' +
                        (isActive ? ' product__variant--active' : '')
                      }
                      onClick={() => setSelectedVariant(i)}
                    >
                      <span className="product__variant-label">
                        {v.label}
                      </span>
                      <span className="product__variant-price">
                        {formatPrice(v.price)}&nbsp;₽
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="product__buy">
            <div className="product__price">
              <span className="product__price-value">
                {formatPrice(currentVariant.price)}
              </span>
              <span className="product__price-currency">₽</span>
              {currentVariant.label && (
                <span className="product__price-unit">
                  /&nbsp;{currentVariant.label}
                </span>
              )}
            </div>
            <button
              type="button"
              className="btn"
              onClick={() => setIsModalOpen(true)}
            >
              Заказать
            </button>
          </div>
        </div>
      </div>

      {/* ----- Описание ----- */}
      <section className="section">
        <h2 className="section__title">Описание</h2>
        <Divider />
        <p className="product__description">{product.description}</p>
      </section>

      {/* ----- Похожие товары ----- */}
      {related.length > 0 && (
        <section className="section">
          <h2 className="section__title">Похожие товары</h2>
          <Divider />
          <div className="cards-grid">
            {related.map((p) => (
              <Card key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}

      <OrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productTitle={product.title}
        variantLabel={currentVariant.label}
      />

      <ImageZoom
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
        src={product.image}
        alt={product.title}
      />
    </main>
  )
}
