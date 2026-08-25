export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__col">
          <p className="footer__brand">ООО «Сыто»</p>
          <p className="footer__text">ЭКОферма Дмитрия Колистратова</p>
        </div>
        <div className="footer__col">
          <p className="footer__text">© {year} Все права защищены</p>
        </div>
      </div>
    </footer>
  )
}
