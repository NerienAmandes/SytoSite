import { Link } from 'react-router-dom'

import data from '../data/dostavka.json'
import Divider from '../components/Divider.jsx'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import useSeo from '../hooks/useSeo.js'

const crumbs = [
  { label: 'Главная', to: '/' },
  { label: 'Доставка и оплата' },
]

export default function Dostavka() {
  useSeo({
    title: 'Доставка и оплата',
    description:
      'Условия доставки и оплаты продукции ЭКОфермы «Сыто» по России. ' +
      'Почта, СДЭК, курьер. Без онлайн-оплаты — заказ по телефону и в мессенджерах.',
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
          <h2 className="section__title">{data.delivery.title}</h2>
          <Divider />
          <div className="advantages__grid">
            {data.delivery.items.map((item, i) => (
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
          <h2 className="section__title">{data.payment.title}</h2>
          <Divider />
          <div className="advantages__grid">
            {data.payment.items.map((item, i) => (
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
          <h2 className="section__title">{data.order.title}</h2>
          <Divider />
          <ol className="steps">
            {data.order.steps.map((step, i) => (
              <li key={i} className="steps__item">
                <span className="steps__num" aria-hidden="true">{i + 1}</span>
                <span className="steps__text">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="page__actions">
            <Link to="/catalog" className="btn">В каталог</Link>
            <Link to="/kontakty" className="btn btn--ghost">Остались вопросы?</Link>
          </div>
        </div>
      </section>
    </>
  )
}
