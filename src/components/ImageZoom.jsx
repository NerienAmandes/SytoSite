import { useEffect } from 'react'

/**
 * Лайтбокс: полноэкранный просмотр картинки с плавным появлением.
 * Закрывается по Escape, клику на подложку и крестику.
 *
 * @param {boolean}  isOpen
 * @param {Function} onClose
 * @param {string}   src
 * @param {string}   alt
 */
export default function ImageZoom({ isOpen, onClose, src, alt }) {
  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen || !src) return null

  return (
    <div
      className="zoom"
      onClick={onClose}
      role="presentation"
    >
      <button
        type="button"
        className="zoom__close"
        onClick={onClose}
        aria-label="Закрыть"
      >
        ×
      </button>
      <img
        className="zoom__image"
        src={src}
        alt={alt || ''}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}
