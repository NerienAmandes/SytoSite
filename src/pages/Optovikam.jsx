import data from '../data/optovikam.json'
import Divider from '../components/Divider.jsx'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import RequestForm from '../components/RequestForm.jsx'
import useSeo from '../hooks/useSeo.js'

const crumbs = [
  { label: 'Главная', to: '/' },
  { label: 'Оптовикам' },
]

export default function Optovikam() {
  useSeo({
    title: 'Оптовикам и партнёрам',
    description:
      'Оптовые поставки натуральной продукции ЭКОфермы «Сыто» для магазинов, кафе и дистрибьюторов. ' +
      'Мёд, напитки, мясные деликатесы. Гибкие условия сотрудничества.',
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
          <h2 className="section__title">{data.conditions.title}</h2>
          <Divider />
          <ul className="checklist">
            {data.conditions.items.map((item, i) => (
              <li key={i} className="checklist__item">
                <span className="checklist__mark" aria-hidden="true">✦</span>
                <span className="checklist__text">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section__title">{data.categories.title}</h2>
          <Divider />
          <div className="page-text">
            <ul className="checklist checklist--inline">
              {data.categories.items.map((item, i) => (
                <li key={i} className="checklist__item">
                  <span className="checklist__mark" aria-hidden="true">✦</span>
                  <span className="checklist__text">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section__title">Оставить заявку</h2>
          <Divider />
          <p className="page__intro">{data.cta.text}</p>
          <div className="form-wrapper form-wrapper--narrow">
            <RequestForm
              submitLabel={data.cta.submitLabel}
              successMessage="Спасибо! Мы подготовим для вас коммерческое предложение и свяжемся в ближайшее время."
            />
          </div>
        </div>
      </section>
    </>
  )
}
