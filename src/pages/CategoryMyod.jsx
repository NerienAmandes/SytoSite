import categories from '../data/categories.json'
import products from '../data/products.json'
import CategoryPage from '../components/CategoryPage.jsx'
import useSeo from '../hooks/useSeo.js'

const SLUG = 'myod'

export default function CategoryMyod() {
  useSeo({
    title: 'Мёд и продукты пчеловодства',
    description:
      'Натуральный мёд, собранный на ЭКОферме «Сыто» в заповеднике «Пустынские озёра». ' +
      'Цветочный, гречишный, липовый — без добавок и термообработки.',
  })
  const category = categories.find((c) => c.slug === SLUG)
  const items = products.filter((p) => p.category === SLUG)
  return <CategoryPage category={category} products={items} />
}
