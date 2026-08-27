import { useEffect, useState } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'

import { categories } from '../data/index.js'
import Search from './Search.jsx'

/**
 * Главное меню. Категории в выпадающем списке берутся из data/index.js —
 * добавил новую категорию в categories.json → она автоматически появится тут.
 *
 * Структура (одна строка):
 *  Логотип · Поиск-иконка · Навигация · Бургер (моб.)
 *
 * На мобильных (< 900px) включается «бургер»: меню прячется,
 * открывается по кнопке-гамбургеру.
 */
export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  // Закрываем меню при переходе на новую страницу (мобилка)
  const location = useLocation()
  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  // Закрываем по Escape
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen])

  return (
    <header className="header">
      <div className="container header__main">
        <Link to="/" className="logo" aria-label="Сыто — на главную">
          <span className="logo__mark" aria-hidden="true">С</span>
          <span className="logo__text">Сыто</span>
        </Link>

        <div className="header__search">
          <Search />
        </div>

        <button
          type="button"
          className={'burger' + (isOpen ? ' burger--open' : '')}
          aria-label={isOpen ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={isOpen}
          aria-controls="primary-nav"
          onClick={() => setIsOpen((v) => !v)}
        >
          <span className="burger__line" />
          <span className="burger__line" />
          <span className="burger__line" />
        </button>

        <nav
          id="primary-nav"
          className={'nav' + (isOpen ? ' nav--open' : '')}
          aria-label="Главное меню"
        >
          <ul className="nav__list">
            <li className="nav__item">
              <NavLink to="/" end className="nav__link">Главная</NavLink>
            </li>
            <li className="nav__item">
              <NavLink to="/syto" className="nav__link">Напиток «Сыто»</NavLink>
            </li>
            <li className="nav__item nav__item--dropdown">
              <NavLink to="/catalog" className="nav__link">
                Каталог <span className="nav__caret" aria-hidden="true">▾</span>
              </NavLink>
              <ul className="dropdown" role="menu">
                {categories.map((c) => (
                  <li key={c.slug} role="none">
                    <NavLink
                      to={`/catalog/${c.slug}`}
                      className="dropdown__link"
                      role="menuitem"
                      onClick={(e) => e.currentTarget.blur()}
                    >
                      {c.title}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </li>
            <li className="nav__item">
              <NavLink to="/o-ferme" className="nav__link">О ферме</NavLink>
            </li>
            <li className="nav__item">
              <NavLink to="/dostavka-i-oplata" className="nav__link">Доставка</NavLink>
            </li>
            <li className="nav__item">
              <NavLink to="/optovikam" className="nav__link">Оптовикам</NavLink>
            </li>
            <li className="nav__item">
              <NavLink to="/faq" className="nav__link">Вопросы</NavLink>
            </li>
            <li className="nav__item">
              <NavLink to="/kontakty" className="nav__link">Контакты</NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
