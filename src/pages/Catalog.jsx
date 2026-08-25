import categories from '../data/categories.json'
import Card from '../components/Card.jsx'
import Divider from '../components/Divider.jsx'
import useSeo from '../hooks/useSeo.js'

export default function Catalog() {
  useSeo({
    title: 'Каталог продукции',
    description:
      'Каталог ЭКОфермы «Сыто»: натуральные медовые напитки, мёд и продукты пчеловодства, ' +
      'мясные деликатесы собственного копчения, гидролаты. Доставка по России.',
  })
  return (
    <main className="container">
      <h1 className="page__title">Каталог</h1>
      <Divider />
      <p className="page__intro">
        Продукция ЭКОфермы «Сыто»: напитки, мёд и&nbsp;продукты пчеловодства,
        мясные деликатесы и&nbsp;натуральные гидролаты.
      </p>

      <div className="cards-grid cards-grid--wide">
        {categories.map((c) => (
          <Card
            key={c.slug}
            variant="category"
            to={`/catalog/${c.slug}`}
            title={c.title}
          >
            {c.shortDescription}
          </Card>
        ))}
      </div>
    </main>
  )
}
