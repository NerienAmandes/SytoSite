import data from '../data/kontakty.json'
import Divider from '../components/Divider.jsx'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import RequestForm from '../components/RequestForm.jsx'
import useSeo from '../hooks/useSeo.js'

const crumbs = [
  { label: 'Главная', to: '/' },
  { label: 'Контакты' },
]

export default function Kontakty() {
  useSeo({
    title: 'Контакты',
    description:
      'Контакты ЭКОфермы «Сыто»: телефон, email, мессенджеры, адрес производства. ' +
      'Заказ продукции и оптовые поставки.',
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
          <div className="contacts__grid">
            <div className="contacts__info">
              <h3 className="contacts__heading">{data.info.company}</h3>
              <p className="contacts__line">{data.info.subtitle}</p>
              <p className="contacts__line">{data.info.address}</p>
              <p className="contacts__line">
                Телефон:&nbsp;
                <a href={data.info.phoneHref}>{data.info.phone}</a>
              </p>
              <p className="contacts__line">
                Email:&nbsp;
                <a href={data.info.emailHref}>{data.info.email}</a>
              </p>
              <p className="contacts__line">Часы работы:&nbsp;{data.info.hours}</p>

              <div className="contacts__social">
                <a
                  href={data.info.social.telegram}
                  className="contacts__social-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Telegram
                </a>
                <a
                  href={data.info.social.whatsapp}
                  className="contacts__social-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>
                <a
                  href={data.info.social.vk}
                  className="contacts__social-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ВКонтакте
                </a>
              </div>
            </div>

            <div>
              <div className="contacts__map" aria-label="Расположение фермы на карте">
                <span className="contacts__map-glyph" aria-hidden="true">⌖</span>
                <span className="contacts__map-text">
                  Карта будет добавлена
                </span>
              </div>

              <RequestForm
                submitLabel={data.form.submitLabel}
                successMessage={data.form.successMessage}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
