import Divider from './Divider.jsx'

/**
 * Универсальная заглушка для страниц, контент которых ещё не готов.
 */
export default function PlaceholderPage({ title, hint }) {
  return (
    <main className="page">
      <div className="container">
        <h1 className="page__title">{title}</h1>
        <Divider />
        <p className="page__notice">Страница в разработке</p>
        {hint && <p className="page__notice">{hint}</p>}
      </div>
    </main>
  )
}
