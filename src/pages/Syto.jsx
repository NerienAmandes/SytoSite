import { Link } from 'react-router-dom'

import data from '../data/syto.json'
import Divider from '../components/Divider.jsx'
import useSeo from '../hooks/useSeo.js'

/**
 * Страница /syto — витрина напитка «Сыто».
 * Секции: О напитке, Рецептура, Свойства, Технология, Преимущества, О компании, Грант.
 * Контент целиком живёт в src/data/syto.json.
 */
export default function Syto() {
  useSeo({
    title: 'Напиток «Сыто» — рецепт Древней Руси',
    description:
      '«Сыто» — биопродукт собственного производства на мёде, лечебных травах и родниковой воде. ' +
      'Рецептура, 9 полезных свойств, вакуумная технология. Без консервантов и красителей.',
  })
  return (
    <>
      <PageIntro data={data.intro} />
      <AboutSection data={data.about} />
      <RecepturaSection data={data.receptura} />
      <SvoystvaSection data={data.svoystva} />
      <TehnologiyaSection data={data.tehnologiya} />
      <AdvantagesSection data={data.advantages} />
      <CompanySection data={data.company} />
      <GrantSection data={data.grant} />
      <FinalCta />
    </>
  )
}

/* ---------------------------- Шапка страницы ---------------------------- */

function PageIntro({ data }) {
  return (
    <section className="page page--syto">
      <div className="container">
        <h1 className="page__title">{data.eyebrow}</h1>
        <Divider />
        <p className="page__intro">{data.lead}</p>
      </div>
    </section>
  )
}

/* ------------------------------- О напитке ------------------------------ */

function AboutSection({ data }) {
  return (
    <section className="section">
      <div className="container">
        <h2 className="section__title">{data.title}</h2>
        <Divider />
        <div className="syto-about">
          {data.paragraphs.map((p, i) => (
            <p key={i} className="syto-about__p">{p}</p>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------- Рецептура ------------------------------ */

function RecepturaSection({ data }) {
  return (
    <section className="section">
      <div className="container">
        <h2 className="section__title">{data.title}</h2>
        <Divider />
        <div className="receptura__grid">
          {data.items.map((item, i) => (
            <div key={i} className="receptura__card">
              <span className="receptura__glyph" aria-hidden="true">
                {item.glyph}
              </span>
              <h3 className="receptura__title">{item.title}</h3>
              <p className="receptura__text">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* -------------------------------- Свойства ------------------------------- */

function SvoystvaSection({ data }) {
  return (
    <section className="section">
      <div className="container">
        <h2 className="section__title">{data.title}</h2>
        <Divider />
        <ol className="svoystva__list">
          {data.items.map((item, i) => (
            <li key={i} className="svoystva__item">
              <span className="svoystva__glyph" aria-hidden="true">
                {item.glyph}
              </span>
              <span className="svoystva__text">{item.text}</span>
            </li>
          ))}
        </ol>
        <p className="svoystva__phrase">{data.phrase}</p>
      </div>
    </section>
  )
}

/* ----------------------------- Технология ------------------------------- */

function TehnologiyaSection({ data }) {
  return (
    <section className="section">
      <div className="container">
        <h2 className="section__title">{data.title}</h2>
        <Divider />
        <div className="tehnologiya__grid">
          {data.items.map((item, i) => (
            <div key={i} className="tehnologiya__card">
              <span className="tehnologiya__num" aria-hidden="true">
                {i + 1}
              </span>
              <h3 className="tehnologiya__title">{item.title}</h3>
              <p className="tehnologiya__text">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ----------------------------- Преимущества ----------------------------- */

function AdvantagesSection({ data }) {
  if (!data?.items?.length) return null
  return (
    <section className="section">
      <div className="container">
        <h2 className="section__title">{data.title}</h2>
        <Divider />
        <div className="syto-advantages__grid">
          {data.items.map((item, i) => (
            <div key={i} className="syto-advantage">
              <span className="syto-advantage__glyph" aria-hidden="true">
                {item.glyph}
              </span>
              <h3 className="syto-advantage__title">{item.title}</h3>
              <p className="syto-advantage__text">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------ О компании ------------------------------ */

function CompanySection({ data }) {
  if (!data) return null
  return (
    <section className="section">
      <div className="container">
        <h2 className="section__title">{data.title}</h2>
        <Divider />
        <p className="syto-company__lead">{data.lead}</p>

        {data.csi && (
          <div className="syto-csi">
            <div className="syto-csi__value">{data.csi.value}</div>
            <div className="syto-csi__label">{data.csi.label}</div>
          </div>
        )}
      </div>
    </section>
  )
}

/* -------------------------------- Грант --------------------------------- */

function GrantSection({ data }) {
  if (!data) return null
  return (
    <section className="section">
      <div className="container">
        <div className="syto-grant">
          <span className="syto-grant__seal" aria-hidden="true">✦</span>
          <div className="syto-grant__body">
            <h2 className="syto-grant__title">{data.title}</h2>
            <p className="syto-grant__text">{data.text}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------------------- Финальный CTA ----------------------------- */

function FinalCta() {
  return (
    <section className="section">
      <div className="container">
        <div className="page__actions">
          <Link to="/product/syto-bezalkogolnyy" className="btn">
            Попробовать «Сыто»
          </Link>
          <Link to="/catalog" className="btn btn--ghost" style={{ marginLeft: '0.75rem' }}>
            В каталог
          </Link>
        </div>
      </div>
    </section>
  )
}
