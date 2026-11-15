export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__col">
          <p className="footer__brand">
            ООО «<span style={{ fontFamily: 'var(--font-vertograd)' }}>С<span className="yery" aria-label="ы"><span className="yery__p" aria-hidden="true">Р</span><span className="yery__i" aria-hidden="true">I</span></span>то</span>»
          </p>
          <p className="footer__text">ЭКОферма Дмитрия Колистратова</p>
        </div>
        <div className="footer__col">
          <p className="footer__text">© {year} Все права защищены</p>
        </div>
      </div>
    </footer>
  )
}
