import { Link } from 'react-router-dom'
import { categoryStyle, minPriceOf, formatPrice } from '../data/index.js'

/**
 * Карточка товара — «купеческая этикетка».
 *
 * API: <Card product={product} />
 * Один источник правды: цена, плейсхолдер, бейдж «Хит» — всё берётся из product.
 */
export default function Card({ product }) {
  if (!product) return null

  const minPrice = minPriceOf(product)
  const hasManyVariants = (product.variants || []).length > 1
  const style = categoryStyle(product.category)
  const isHit = !!product.featured
  const isAvailable = product.available !== false

  return (
    <Link to={`/product/${product.slug}`} className="card product-card">
      {/* Плашка-категория + бейдж «Хит» */}
      <div className="product-card__top">
        <span
          className="product-card__cat"
          style={{ backgroundColor: style.tint }}
        >
          {style.label}
        </span>
        {isHit && <span className="product-card__hit">✦ Хит</span>}
      </div>

      {product.image ? (
        <div className="product-card__media">
          <img
            src={product.image}
            alt={product.title}
            className="product-card__image"
            loading="lazy"
            decoding="async"
            style={product.imageSprite ? { objectPosition: product.imageSprite, objectFit: 'cover' } : {}}
          />
        </div>
      ) : (
        <div
          className="product-card__media"
          style={{ backgroundColor: `${style.tint}55` }}
          aria-hidden="true"
        >
          <span className="product-card__glyph">{style.glyph}</span>
        </div>
      )}

      {/* Тело: заголовок + описание */}
      <div className="product-card__body">
        <h3 className="product-card__title">{product.title}</h3>
        {product.shortDescription && (
          <p className="product-card__text">{product.shortDescription}</p>
        )}
      </div>

      {/* Цена + кнопка */}
      <div className="product-card__footer">
        <div className="product-card__price">
          {minPrice !== null ? (
            <>
              {hasManyVariants && (
                <span className="product-card__price-from">от</span>
              )}
              <span className="product-card__price-value">
                {formatPrice(minPrice)}
              </span>
              <span className="product-card__price-currency">₽</span>
            </>
          ) : (
            <span className="product-card__price-value">По запросу</span>
          )}
          {product.pricePer && (
            <span className="product-card__price-unit">/ {product.pricePer}</span>
          )}
        </div>

        <span className="btn btn--sm product-card__cta">
          {isAvailable ? 'Подробнее' : 'Скоро'}
        </span>
      </div>
    </Link>
  )
}
