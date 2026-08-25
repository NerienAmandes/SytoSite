import categories from '../data/categories.json'
import products from '../data/products.json'
import CategoryPage from '../components/CategoryPage.jsx'
import useSeo from '../hooks/useSeo.js'

const SLUG = 'napitki'

export default function CategoryNapitki() {
  useSeo({
    title: 'Медовые напитки',
    description:
      'Натуральные медовые напитки «Сыто» на мёде и лечебных травах. ' +
      'Безалкогольные, без консервантов. Идеально для укрепления иммунитета.',
  })
  const category = categories.find((c) => c.slug === SLUG)
  const items = products.filter((p) => p.category === SLUG)
  return <CategoryPage category={category} products={items} />
}
