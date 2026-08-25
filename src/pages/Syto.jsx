import { Link } from 'react-router-dom'

import data from '../data/syto.json'
import Divider from '../components/Divider.jsx'
import useSeo from '../hooks/useSeo.js'

/**
 * Страница /syto — «О напитке», «Рецептура», «Свойства», «Технология».
 * Вся текстовая часть берётся из src/data/syto.json, чтобы редактировать
 * контент без правки компонента.
 */
export default function Syto() {
  useSeo({
    title: 'Напиток «Сыто» — рецепт Древней Руси',
    description:
      '«Сыто» — исконно русский медово-травяной напиток на мёде и лечебных травах. ' +
      'Рецептура, 9 полезных свойств и технология приготовления. Без алкоголя и консервантов.',
  })
  return (
    <>
      <PageIntro data={data.intro} />
      <AboutSection data={data.about} />
      <RecepturaSection data={data.receptura} />
      <SvoystvaSection data={data.svoystva} />
      <TehnologiyaSection data={data.tehnologiya} />
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
            <p key={i} className="syto-about__p">
              {p}
            </p>
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
              {item}
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

        <div className="page__actions">
          <Link to="/product/syto-bezalkogolnyy" className="btn">
            Попробовать «Сыто»
          </Link>
        </div>
      </div>
    </section>
  )
}
