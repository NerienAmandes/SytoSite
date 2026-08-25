import categories from '../data/categories.json'
import products from '../data/products.json'
import CategoryPage from '../components/CategoryPage.jsx'
import useSeo from '../hooks/useSeo.js'

const SLUG = 'myasnye-delikatesy'

/* Конфиг фильтра соответствует тегам в products.json */
const MEAT_FILTERS = [
  { value: 'all',               label: 'Все' },
  { value: 'горячее копчение',  label: 'Горячее копчения' },
  { value: 'сыровяленые',       label: 'Сыровяленые' },
  { value: 'колбаса',           label: 'Колбасы' },
  { value: 'сало',              label: 'Сало' },
]

export default function CategoryMyasnye() {
  useSeo({
    title: 'Мясные деликатесы',
    description:
      'Мясные деликатесы собственного производства ЭКОфермы «Сыто»: горячего и холодного копчения, ' +
      'сыровяленые, колбасы, сало. Натуральное фермерское мясо без консервантов.',
  })
  const category = categories.find((c) => c.slug === SLUG)
  const items = products.filter((p) => p.category === SLUG)
  return (
    <CategoryPage
      category={category}
      products={items}
      showFilters
      filters={MEAT_FILTERS}
    />
  )
}
