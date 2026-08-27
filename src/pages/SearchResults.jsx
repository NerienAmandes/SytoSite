import { useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'

import { searchProducts } from '../data/index.js'
import Card from '../components/Card.jsx'
import Divider from '../components/Divider.jsx'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import useSeo from '../hooks/useSeo.js'

export default function SearchResults() {
  const [params] = useSearchParams()
  const q = (params.get('q') || '').trim()

  const results = useMemo(() => (q ? searchProducts(q) : []), [q])

  useSeo({
    title: q ? `Поиск: ${q}` : 'Поиск',
    description: q
      ? `Результаты поиска по запросу «${q}» в каталоге ЭКОфермы «Сыто».`
      : 'Поиск по каталогу ЭКОфермы «Сыто».',
  })

  return (
    <main className="container">
      <Breadcrumbs
        items={[{ label: 'Главная', to: '/' }, { label: 'Поиск' }]}
      />

      <h1 className="page__title">
        {q ? (
          <>
            Поиск: <span className="search-results__query">«{q}»</span>
          </>
        ) : (
          'Поиск'
        )}
      </h1>
      <Divider />

      {!q ? (
        <p className="page__empty">
          Введите запрос в строке поиска — мёд, травы, гидролат, название товара.
        </p>
      ) : results.length === 0 ? (
        <>
          <p className="page__empty">
            По запросу <strong>«{q}»</strong> ничего не нашлось.
          </p>
          <p className="page__empty">
            Попробуйте поискать иначе или загляните в{' '}
            <Link to="/catalog">весь каталог</Link>.
          </p>
        </>
      ) : (
        <>
          <p className="search-results__count">
            Нашли: <strong>{results.length}</strong>{' '}
            {pluralize(results.length, ['товар', 'товара', 'товаров'])}
          </p>
          <div className="cards-grid">
            {results.map((p) => (
              <Card key={p.slug} product={p} />
            ))}
          </div>
        </>
      )}
    </main>
  )
}

// Простая русская плюрализация: 1 товар, 2 товара, 5 товаров
function pluralize(n, forms) {
  const n10 = n % 10
  const n100 = n % 100
  if (n10 === 1 && n100 !== 11) return forms[0]
  if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return forms[1]
  return forms[2]
}
