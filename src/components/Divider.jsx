/**
 * Орнаментальный разделитель секций.
 * Простой SVG-орнамент в духе древнерусской резьбы:
 * длинные линии по краям, точки, центральный ромб с «окном».
 * Цвет берётся из currentColor — перекрашивается через CSS.
 */
export default function Divider({ className = '' }) {
  return (
    <div className={`divider ${className}`.trim()} aria-hidden="true">
      <svg
        viewBox="0 0 240 24"
        xmlns="http://www.w3.org/2000/svg"
        className="divider__svg"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Левая линия */}
        <line x1="0" y1="12" x2="88" y2="12" className="divider__line" />
        {/* Левая точка */}
        <circle cx="96" cy="12" r="2" className="divider__fill" />
        {/* Внешний ромб */}
        <path
          d="M 120 3 L 132 12 L 120 21 L 108 12 Z"
          className="divider__fill"
        />
        {/* Внутренний ромб — «окно», просвечивает фон страницы */}
        <path
          d="M 120 8 L 127 12 L 120 16 L 113 12 Z"
          className="divider__bg"
        />
        {/* Правая точка */}
        <circle cx="144" cy="12" r="2" className="divider__fill" />
        {/* Правая линия */}
        <line x1="152" y1="12" x2="240" y2="12" className="divider__line" />
      </svg>
    </div>
  )
}
