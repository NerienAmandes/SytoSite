import { Routes, Route } from 'react-router-dom'

import Layout from './components/Layout.jsx'

import Home from './pages/Home.jsx'
import Syto from './pages/Syto.jsx'
import Catalog from './pages/Catalog.jsx'
import Category from './pages/Category.jsx'  // ← ОДИН универсальный компонент
import Product from './pages/Product.jsx'
import OFerme from './pages/OFerme.jsx'
import Dostavka from './pages/Dostavka.jsx'
import Optovikam from './pages/Optovikam.jsx'
import Kontakty from './pages/Kontakty.jsx'
import SearchResults from './pages/SearchResults.jsx'
import FaqPage from './pages/FaqPage.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/syto" element={<Syto />} />
        <Route path="/catalog" element={<Catalog />} />

        {/* ОДИН роут для всех категорий: /catalog/napitki, /catalog/myod, /catalog/myasnye-delikatesy, /catalog/gidrolaty */}
        <Route path="/catalog/:categorySlug" element={<Category />} />
        <Route path="/product/:slug" element={<Product />} />
        <Route path="/o-ferme" element={<OFerme />} />
        <Route path="/dostavka-i-oplata" element={<Dostavka />} />
        <Route path="/optovikam" element={<Optovikam />} />
        <Route path="/kontakty" element={<Kontakty />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}