import { Link } from 'react-router-dom'

/**
 * Универсальная карточка в стиле «купеческой этикетки».
 * variant: 'product' (товар) | 'category' (категория)
 *
 * Если передан `to` — карточка становится ссылкой.
 * Контент (описание, цена, кнопка) добавляется через children.
 */
export default function Card({
  variant = 'product',
  image,
  imageAlt,
  title,
  to,
  children,
  className = '',
}) {
  const classes = `card card--${variant} ${className}`.trim()

  const content = (
    <>
      {image && (
        <div className="card__image-wrap">
          <img
            className="card__image"
            src={image}
            alt={imageAlt || title || ''}
            loading="lazy"
          />
        </div>
      )}
      {title && <h3 className="card__title">{title}</h3>}
      {children && <div className="card__body">{children}</div>}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    )
  }

  return <article className={classes}>{content}</article>
}
