import { NavLink, Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="header">
      <div className="container header__inner">
        <Link to="/" className="logo" aria-label="Сыто — на главную">
          <span className="logo__mark" aria-hidden="true">С</span>
          <span className="logo__text">Сыто</span>
        </Link>

        <nav className="nav" aria-label="Главное меню">
          <ul className="nav__list">
            <li className="nav__item">
              <NavLink to="/" end className="nav__link">Главная</NavLink>
            </li>
            <li className="nav__item">
              <NavLink to="/syto" className="nav__link">Напиток «Сыто»</NavLink>
            </li>
            <li className="nav__item nav__item--dropdown">
              <NavLink to="/catalog" className="nav__link">
                Каталог <span aria-hidden="true">▾</span>
              </NavLink>
              <ul className="dropdown" role="menu">
                <li role="none">
                  <NavLink to="/catalog/napitki" className="dropdown__link" role="menuitem">
                    Напитки
                  </NavLink>
                </li>
                <li role="none">
                  <NavLink to="/catalog/myod" className="dropdown__link" role="menuitem">
                    Мёд
                  </NavLink>
                </li>
                <li role="none">
                  <NavLink to="/catalog/myasnye-delikatesy" className="dropdown__link" role="menuitem">
                    Мясные деликатесы
                  </NavLink>
                </li>
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
              <NavLink to="/kontakty" className="nav__link">Контакты</NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
