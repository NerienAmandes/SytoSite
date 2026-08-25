import { Link } from 'react-router-dom'

import data from '../data/oferme.json'
import Divider from '../components/Divider.jsx'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import useSeo from '../hooks/useSeo.js'

const crumbs = [
  { label: 'Главная', to: '/' },
  { label: 'О ферме' },
]

export default function OFerme() {
  useSeo({
    title: 'О ферме',
    description:
      'ЭКОферма Дмитрия Колистратова в заповеднике «Пустынские озёра». ' +
      'Полный цикл производства натуральных продуктов: мёд, травы, мясные деликатесы, гидролаты.',
  })
  return (
    <>
      <section className="page">
        <div className="container">
          <Breadcrumbs items={crumbs} />
          <h1 className="page__title">{data.title}</h1>
          <Divider />
          <p className="page__intro">{data.lead}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section__title">{data.about.title}</h2>
          <Divider />
          <div className="page-text">
            {data.about.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section__title">{data.values.title}</h2>
          <Divider />
          <div className="advantages__grid">
            {data.values.items.map((item, i) => (
              <div key={i} className="advantage">
                <div className="advantage__icon" aria-hidden="true">
                  {item.icon}
                </div>
                <h3 className="advantage__title">{item.title}</h3>
                <p className="advantage__text">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="page__actions">
            <Link to="/catalog" className="btn">В каталог</Link>
            <Link to="/kontakty" className="btn btn--ghost">Связаться с нами</Link>
          </div>
        </div>
      </section>
    </>
  )
}
