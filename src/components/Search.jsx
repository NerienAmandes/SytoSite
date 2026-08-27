import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { searchProducts, categoryStyle, minPriceOf, formatPrice } from '../data/index.js'

const SUGGEST_LIMIT = 6

/**
 * Поиск по товарам: иконка-раскрывашка.
 * - Свёрнут: только иконка 🔍
 * - По клику: плавно раскрывается поле ввода + фокус
 * - Ввод → подсказки в реальном времени (до 6 шт.)
 * - Enter → переход на /search?q=...
 * - Esc / клик вне / клик по иконке-крестику → закрывает
 */
export default function Search() {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)        // выпадашка с подсказками
  const [isExpanded, setIsExpanded] = useState(false) // раскрыто ли поле ввода
  const [activeIndex, setActiveIndex] = useState(-1)
  const navigate = useNavigate()
  const rootRef = useRef(null)
  const inputRef = useRef(null)

  const suggestions = query.trim() ? searchProducts(query, SUGGEST_LIMIT) : []
  const showDropdown = isOpen && isExpanded && query.trim().length > 0

  // Закрываем выпадашку по клику вне
  useEffect(() => {
    const onClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setIsOpen(false)
        // Сворачиваем поле, если оно пустое
        if (!query.trim()) setIsExpanded(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [query])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
        if (!query.trim()) {
          setIsExpanded(false)
          inputRef.current?.blur()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [query])

  useEffect(() => {
    setActiveIndex(-1)
  }, [query])

  function submit(queryText) {
    const q = (queryText ?? query).trim()
    if (!q) return
    setIsOpen(false)
    setIsExpanded(false)
    navigate(`/search?q=${encodeURIComponent(q)}`)
  }

  function toggle() {
    if (isExpanded) {
      // Свернуть
      if (query.trim()) {
        setQuery('')
      } else {
        setIsExpanded(false)
        setIsOpen(false)
        inputRef.current?.blur()
      }
    } else {
      setIsExpanded(true)
      // Небольшая задержка, чтобы инпут успел отрендериться
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        navigate(`/product/${suggestions[activeIndex].slug}`)
        setIsOpen(false)
        setIsExpanded(false)
      } else {
        submit()
      }
    }
  }

  return (
    <div
      className={'search' + (isExpanded ? ' search--expanded' : '')}
      ref={rootRef}
      role="search"
    >
      <button
        type="button"
        className="search__toggle"
        onClick={toggle}
        aria-label={isExpanded ? 'Свернуть поиск' : 'Открыть поиск'}
        aria-expanded={isExpanded}
      >
        <span className="search__icon" aria-hidden="true">
          {isExpanded && query.trim() ? '✕' : '⌕'}
        </span>
      </button>

      <input
        ref={inputRef}
        type="search"
        className="search__input"
        placeholder="Найти мёд, травы, гидролат…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={onKeyDown}
        aria-label="Поиск товаров"
        autoComplete="off"
        tabIndex={isExpanded ? 0 : -1}
      />

      {showDropdown && (
        <div className="search__dropdown" role="listbox">
          {suggestions.length === 0 ? (
            <div className="search__empty">Ничего не нашли — попробуйте иначе</div>
          ) : (
            <>
              <ul className="search__list">
                {suggestions.map((p, i) => {
                  const style = categoryStyle(p.category)
                  const minPrice = minPriceOf(p)
                  return (
                    <li key={p.slug}>
                      <button
                        type="button"
                        className={
                          'search__item' +
                          (i === activeIndex ? ' search__item--active' : '')
                        }
                        onClick={() => {
                          navigate(`/product/${p.slug}`)
                          setIsOpen(false)
                          setIsExpanded(false)
                          setQuery('')
                        }}
                        onMouseEnter={() => setActiveIndex(i)}
                        role="option"
                        aria-selected={i === activeIndex}
                      >
                        <span
                          className="search__item-glyph"
                          style={{ backgroundColor: `${style.tint}55` }}
                          aria-hidden="true"
                        >
                          {style.glyph}
                        </span>
                        <span className="search__item-text">
                          <span className="search__item-title">{p.title}</span>
                          <span className="search__item-cat">{style.label}</span>
                        </span>
                        {minPrice !== null && (
                          <span className="search__item-price">
                            от {formatPrice(minPrice)}&nbsp;₽
                          </span>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
              <button
                type="button"
                className="search__more"
                onClick={() => submit()}
              >
                Показать все результаты →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
