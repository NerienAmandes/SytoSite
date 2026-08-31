import { Link } from 'react-router-dom'

import { categoryStyle, categories, products, faq, imageDims } from '../data/index.js'
import Card from '../components/Card.jsx'
import Divider from '../components/Divider.jsx'
import RequestForm from '../components/RequestForm.jsx'
import Faq from '../components/Faq.jsx'
import useSeo from '../hooks/useSeo.js'

/* Хиты продаж подбираются из products.json фильтром по `featured: true`,
   чтобы витрина собиралась из данных, а не из хардкода. */
const hits = products.filter((p) => p.featured)

/* На главной показываем первые 3 вопроса, остальные — на /faq */
const HOME_FAQ_COUNT = 3
const faqPreview = faq.slice(0, HOME_FAQ_COUNT)

/* ===== Преимущества — контент-слой (можно вынести в CMS/JSON позже) ===== */
const ADVANTAGES = [
  {
    icon: '🌿',
    title: '100% натурально',
    text: 'Только мёд, лечебные травы и ягоды. Без консервантов, красителей и искусственных добавок — как в старину.',
  },
  {
    icon: '🏞️',
    title: 'Заповедник «Пустынские озёра»',
    text: 'Сырьё собирается в экологически чистом регионе, вдали от промышленных зон и дорог.',
  },
  {
    icon: '🏡',
    title: 'Своё производство',
    text: 'Полный цикл на собственной ЭКОферме — от сбора мёда и трав до готового продукта на вашем столе.',
  },
]

/* ===================================================================== */

export default function Home() {
  useSeo({
    title: 'Натуральные продукты с ЭКОфермы',
    description:
      'Сыто — ЭКОферма Дмитрия Колистратова в заповеднике «Пустынские озёра». ' +
      'Мёд, медовые напитки, мясные деликатесы и гидролаты без консервантов и красителей. ' +
      'Доставка по России.',
  })

  return (
    <>
      <HeroSection />
      <AboutSection />
      <CategoriesSection />
      <HitsSection hits={hits} />
      <AdvantagesSection />
      {faqPreview.length > 0 && <FaqSection items={faqPreview} />}
      <ContactsSection />
    </>
  )
}

/* ----------------------------- 1. HERO ----------------------------- */

function HeroSection() {
  return (
    <section className="hero">
      <div className="container">
        <h1 className="hero__title">
          Исконно русский десертный безалкогольный медово-травяной напиток «Сыто»
        </h1>
        <Divider />
        <p className="hero__subtitle">
          Воссозданный по рецептам Древней Руси — на меду и лечебных травах,
          без консервантов и искусственных добавок
        </p>
        <div className="hero__cta">
          <Link to="/syto" className="btn">Приобрести напиток</Link>
        </div>
      </div>
    </section>
  )
}

/* ---------------------------- 2. О напитке ------------------------ */

function AboutSection() {
  return (
    <section className="section">
      <div className="container">
        <h2 className="section__title">О напитке</h2>
        <Divider />
        <p className="about__text">
          «Сыто» — медово-травяной напиток, воссозданный по рецептам Древней Руси.
          Готовится на натуральном мёде с добавлением сбора лечебных трав,
          без градуса и без сахара. Подходит взрослым и детям,
          мягко тонизирует и утоляет жажду.
        </p>
        <div className="page__actions">
          <Link to="/syto" className="btn">Подробнее</Link>
        </div>
      </div>
    </section>
  )
}

/* -------------------------- 3. Категории -------------------------- */

function CategoriesSection() {
  return (
    <section className="section">
      <div className="container">
        <h2 className="section__title">Каталог</h2>
        <Divider />
        <div className="cards-grid cards-grid--wide">
          {categories.map((c) => {
            const style = categoryStyle(c.slug)
            return (
              <Link
                key={c.slug}
                to={`/catalog/${c.slug}`}
                className="card category-card"
              >
                <div
                  className="category-card__media"
                  style={c.image ? { backgroundColor: style.tint, padding: 0 } : { backgroundColor: style.tint }}
                  aria-hidden="true"
                >
                  {c.image ? (
                    <img
                      src={c.image}
                      alt=""
                      className="category-card__image"
                      loading="lazy"
                      decoding="async"
                      width={imageDims(c.image)?.w}
                      height={imageDims(c.image)?.h}
                    />
                  ) : (
                    <span className="category-card__glyph">{style.glyph}</span>
                  )}
                </div>
                <h3 className="category-card__title">{c.title}</h3>
                {c.shortDescription && (
                  <p className="category-card__text">{c.shortDescription}</p>
                )}
                <span className="category-card__cta">Смотреть →</span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ---------------------------- 4. Хиты ----------------------------- */

function HitsSection({ hits }) {
  if (!hits || hits.length === 0) return null
  return (
    <section className="section">
      <div className="container">
        <h2 className="section__title">Хиты продаж</h2>
        <Divider />
        <div className="cards-grid">
          {hits.map((p) => (
            <Card key={p.slug} product={p} />
          ))}
        </div>
        <div className="page__actions">
          <Link to="/catalog" className="btn btn--ghost">Весь каталог</Link>
        </div>
      </div>
    </section>
  )
}

/* ------------------------ 5. Преимущества ------------------------- */

function AdvantagesSection() {
  return (
    <section className="section">
      <div className="container">
        <h2 className="section__title">Наши преимущества</h2>
        <Divider />
        <div className="advantages__grid">
          {ADVANTAGES.map((item, i) => (
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
  )
}

/* ----------------- 6. Контакты + форма обратной связи ------------- */

function ContactsSection() {
  return (
    <section className="section">
      <div className="container">
        <h2 className="section__title">Свяжитесь с нами</h2>
        <Divider />
        <div className="contacts__grid">
          <div className="contacts__info">
            <h3 className="contacts__heading">ООО «Сыто»</h3>
            <p className="contacts__line">ЭКОферма Дмитрия Колистратова</p>
            <p className="contacts__line">
              Телефон:&nbsp;
              <a href="tel:+79032387062">+7 (903) 238-70-62</a>
            </p>
            <p className="contacts__line">
              Email:&nbsp;
              <a href="mailto:dmitriikolistratov@mail.ru">dmitriikolistratov@mail.ru</a>
            </p>
            <p className="contacts__line">
              Адрес:&nbsp;143144, Московская область, г. Руза, п. Колюбакино, ул. Советская, д. 65
            </p>
            <p className="contacts__line">
              <Link to="/kontakty">Все контакты →</Link>
            </p>
          </div>

          <RequestForm
            submitLabel="Отправить заявку"
            successMessage="Спасибо! Мы свяжемся с вами в ближайшее время."
          />
        </div>
      </div>
    </section>
  )
}

/* ------------------ 7. Частые вопросы (превью) -------------------- */

function FaqSection({ items }) {
  return (
    <section className="section">
      <div className="container">
        <h2 className="section__title">Частые вопросы</h2>
        <Divider />
        <Faq items={items} defaultOpenIndex={-1} />
        <div className="page__actions">
          <Link to="/faq" className="btn btn--ghost">
            Все вопросы →
          </Link>
        </div>
      </div>
    </section>
  )
}
