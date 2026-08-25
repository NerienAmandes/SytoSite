import categories from '../data/categories.json'
import products from '../data/products.json'
import CategoryPage from '../components/CategoryPage.jsx'
import useSeo from '../hooks/useSeo.js'

const SLUG = 'gidrolaty'

export default function CategoryGidrolaty() {
  useSeo({
    title: 'Гидролаты',
    description:
      'Натуральные гидролаты (цветочные воды) ЭКОфермы «Сыто» — для ухода за кожей и ароматерапии. ' +
      'Без спирта и консервантов, паровая дистилляция лечебных трав.',
  })
  const category = categories.find((c) => c.slug === SLUG)
  const items = products.filter((p) => p.category === SLUG)
  return <CategoryPage category={category} products={items} />
}
