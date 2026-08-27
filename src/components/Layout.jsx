import { Outlet } from 'react-router-dom'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import Preloader from './Preloader.jsx'

export default function Layout() {
  return (
    <div className="app">
      <Preloader />
      <div className="app__main">
        <Header />
        <Outlet />
        <Footer />
      </div>
    </div>
  )
}
