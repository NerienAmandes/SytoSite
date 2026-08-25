import { Routes, Route } from 'react-router-dom'

import Layout from './components/Layout.jsx'

import Home from './pages/Home.jsx'
import Syto from './pages/Syto.jsx'
import Catalog from './pages/Catalog.jsx'
import CategoryNapitki from './pages/CategoryNapitki.jsx'
import CategoryMyod from './pages/CategoryMyod.jsx'
import CategoryMyasnye from './pages/CategoryMyasnye.jsx'
import Product from './pages/Product.jsx'
import OFerme from './pages/OFerme.jsx'
import Dostavka from './pages/Dostavka.jsx'
import Optovikam from './pages/Optovikam.jsx'
import Kontakty from './pages/Kontakty.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/syto" element={<Syto />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/catalog/napitki" element={<CategoryNapitki />} />
        <Route path="/catalog/myod" element={<CategoryMyod />} />
        <Route path="/catalog/myasnye-delikatesy" element={<CategoryMyasnye />} />
        <Route path="/catalog/gidrolaty" element={<CategoryGidrolaty />} />
        <Route path="/product/:slug" element={<Product />} />
        <Route path="/o-ferme" element={<OFerme />} />
        <Route path="/dostavka-i-oplata" element={<Dostavka />} />
        <Route path="/optovikam" element={<Optovikam />} />
        <Route path="/kontakty" element={<Kontakty />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
