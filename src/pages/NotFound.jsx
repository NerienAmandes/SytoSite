import { Link } from 'react-router-dom'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import useSeo from '../hooks/useSeo.js'

/* Силуэт дальнего леса: треугольные кроны разной высоты, два слоя — задний
   светлее, передний темнее, чтобы дать ощущение глубины. */
function ForestSVG() {
  return (
    <svg
      className="notfound__forest"
      viewBox="0 0 600 140"
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
    >
      <g className="notfound__trees notfound__trees--back">
        <path d="M0,140 L0,110 L20,80 L34,100 L52,68 L70,95 L88,72 L106,98 L124,60 L142,90 L160,75 L178,98 L196,55 L214,88 L232,70 L250,95 L268,60 L286,90 L304,72 L322,98 L340,55 L358,88 L376,75 L394,98 L412,62 L430,90 L448,72 L466,98 L484,60 L502,90 L520,75 L538,98 L556,65 L574,92 L592,80 L600,90 L600,140 Z" />
      </g>
      <g className="notfound__trees notfound__trees--front">
        <path d="M0,140 L0,118 L24,86 L42,112 L62,72 L82,108 L100,82 L122,114 L142,76 L164,110 L184,88 L208,118 L230,72 L252,108 L274,86 L298,118 L320,80 L342,112 L362,92 L384,118 L406,74 L428,110 L450,88 L474,118 L496,82 L518,112 L540,90 L562,118 L584,86 L600,108 L600,140 Z" />
      </g>
    </svg>
  )
}

/* Маленький домик-«красный угол» с огоньком внутри — символ уюта, куда
   предлагаем вернуться. */
function DoorSVG() {
  return (
    <svg
      className="notfound__door"
      viewBox="0 0 64 96"
      aria-hidden="true"
    >
      {/* Свет от двери — рассеянное свечение */}
      <ellipse cx="32" cy="38" rx="34" ry="42" className="notfound__door-glow" />
      {/* Рама */}
      <rect x="10" y="14" width="44" height="78" rx="2" className="notfound__door-frame" />
      {/* Дверь */}
      <rect x="14" y="18" width="36" height="74" rx="1" className="notfound__door-leaf" />
      {/* Огонёк — крест в красном углу */}
      <g className="notfound__door-cross">
        <rect x="30" y="38" width="4" height="22" />
        <rect x="22" y="44" width="20" height="4" />
      </g>
      {/* Ручка */}
      <circle cx="44" cy="60" r="1.6" className="notfound__door-knob" />
    </svg>
  )
}

const crumbs = [
  { label: 'Главная', to: '/' },
  { label: '404' },
]

export default function NotFound() {
  useSeo({
    title: 'Страница не найдена (404)',
    description:
      'Запрошенная страница не найдена на сайте ЭКОфермы «Сыто». ' +
      'Вернитесь на главную или в каталог продукции.',
  })
  return (
    <main className="notfound">
      <div className="container notfound__container">
        <Breadcrumbs items={crumbs} />

        <div className="notfound__inner">
          <ForestSVG />

          <h1 className="notfound__code">404</h1>

          <p className="notfound__quote">
            «Заблудился в&nbsp;лесах нижегородских»
          </p>

          <div className="notfound__divider" aria-hidden="true">✦ ✦ ✦</div>

          <p className="notfound__hint">
            Страница, на&nbsp;которую ты хотел зайти, не&nbsp;нашлась на&nbsp;тропе.
            <br />
            Вернись в&nbsp;красный угол&nbsp;— там светло и&nbsp;уютно.
          </p>

          <div className="notfound__actions">
            <Link to="/" className="btn notfound__door-btn">
              <DoorSVG />
              <span>Вернись в&nbsp;красный угол</span>
            </Link>
            <Link to="/catalog" className="btn btn--ghost">
              В каталог
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
