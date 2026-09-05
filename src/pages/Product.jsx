import { useEffect, useRef, useState } from 'react'
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
      key={product.slug}
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
  const [isVariantOpen, setIsVariantOpen] = useState(false)
  const variantDropdownRef = useRef(null)

  // Если у товара есть gallery — берём активное фото из неё, иначе из image.
  const gallery = Array.isArray(product.gallery) && product.gallery.length > 0
    ? product.gallery
    : null
  const [activeImage, setActiveImage] = useState(product.image)

  const currentVariant = product.variants[selectedVariant] || product.variants[0]

  // Закрываем выпадашку фасовки по клику вне и Escape
  useEffect(() => {
    if (!isVariantOpen) return

    function handleClickOutside(e) {
      if (
        variantDropdownRef.current &&
        !variantDropdownRef.current.contains(e.target)
      ) {
        setIsVariantOpen(false)
      }
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') setIsVariantOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isVariantOpen])

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
          {activeImage ? (
            <img
              src={activeImage}
              alt={product.title}
              className="product__image"
              loading="lazy"
              decoding="async"
              width={imageDims(activeImage)?.w}
              height={imageDims(activeImage)?.h}
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

          {/* Миниатюры галереи (если есть) */}
          {gallery && gallery.length > 1 && (
            <ul
              className="product__thumbs"
              role="tablist"
              aria-label="Дополнительные фото"
            >
              {gallery.map((src, index) => {
                const isActive = src === activeImage
                return (
                  <li key={`${src}-${index}`} className="product__thumbs-item">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      className={
                        'product__thumb' +
                        (isActive ? ' product__thumb--active' : '')
                      }
                      onClick={() => setActiveImage(src)}
                    >
                      <img
                        src={src}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        width={imageDims(src)?.w}
                        height={imageDims(src)?.h}
                      />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* ----- Информация ----- */}
        <div className="product__info">
          <h1 className="product__title">{product.title}</h1>
          <Divider />

          <p className="product__short">{product.shortDescription}</p>

          {product.variants.length > 0 && (
            <div
              className={
                'product__variants' +
                (isVariantOpen ? ' product__variants--open' : '')
              }
              ref={variantDropdownRef}
            >
              <h3 className="product__variants-title">Фасовка</h3>
              <button
                type="button"
                className="product__variant-toggle"
                onClick={() => setIsVariantOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={isVariantOpen}
              >
                <span className="product__variant-toggle-label">
                  {currentVariant.label}
                </span>
                <span className="product__variant-toggle-price">
                  {formatPrice(currentVariant.price)}&nbsp;₽
                </span>
                <span
                  className="product__variant-toggle-arrow"
                  aria-hidden="true"
                >
                  ▾
                </span>
              </button>
              {isVariantOpen && (
                <ul
                  className="product__variant-list"
                  role="listbox"
                  aria-label="Выбор фасовки"
                >
                  {product.variants.map((v, i) => {
                    const isActive = i === selectedVariant
                    return (
                      <li
                        key={i}
                        className={
                          'product__variant-item' +
                          (isActive ? ' product__variant-item--active' : '')
                        }
                        role="option"
                        aria-selected={isActive}
                      >
                        <button
                          type="button"
                          className="product__variant"
                          onClick={() => {
                            setSelectedVariant(i)
                            if (v.image) {
                              setActiveImage(v.image)
                            }
                            setIsVariantOpen(false)
                          }}
                        >
                          <span className="product__variant-label">
                            {v.label}
                          </span>
                          <span className="product__variant-price">
                            {formatPrice(v.price)}&nbsp;₽
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )}

          {product.category === 'napitki' && (
            <p className="product__discount-note" role="note">
              <span className="product__discount-note-icon" aria-hidden="true">
                ✦
              </span>
              <span>
                <strong>Скидка за&nbsp;количество:</strong>{' '}
                от&nbsp;3&nbsp;шт.&nbsp;— 5%, от&nbsp;5&nbsp;шт.&nbsp;— 10%.
                Применяется автоматически в&nbsp;форме заказа.
              </span>
            </p>
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
        unitPrice={currentVariant.price}
        isNapitok={product.category === 'napitki'}
      />

      <ImageZoom
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
        src={activeImage}
        alt={product.title}
      />
    </main>
  )
}
