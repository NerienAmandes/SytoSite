import { Link } from 'react-router-dom'

import Faq from '../components/Faq.jsx'
import Divider from '../components/Divider.jsx'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import RequestForm from '../components/RequestForm.jsx'
import useSeo from '../hooks/useSeo.js'

export default function FaqPage() {
  useSeo({
    title: 'Частые вопросы',
    description:
      'Ответы на популярные вопросы о напитке «Сыто»: срок годности, состав, сбор трав, аллергены.',
  })

  return (
    <main className="container">
      <Breadcrumbs
        items={[{ label: 'Главная', to: '/' }, { label: 'Частые вопросы' }]}
      />

      <h1 className="page__title">Частые вопросы</h1>
      <Divider />
      <p className="page__intro">
        Собрали самые популярные вопросы о напитке «Сыто» — о составе, сроках
        и сборе. Если не нашли свой — напишите нам, ответим лично.
      </p>

      <Faq />

      <section className="section faq__cta">
        <h2 className="section__title">Не нашли свой вопрос?</h2>
        <Divider />
        <RequestForm
          submitLabel="Спросить"
          successMessage="Спасибо! Мы ответим в ближайшее время."
        />
        <p className="page__actions">
          Или посмотрите{' '}
          <Link to="/kontakty">контакты</Link> и{' '}
          <Link to="/dostavka-i-oplata">доставку</Link>.
        </p>
      </section>
    </main>
  )
}
