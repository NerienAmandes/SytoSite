import { createContext, useContext, useEffect, useState } from 'react'
import {
  products as fallbackProducts,
  categories as fallbackCategories,
  faq,
} from '../data/index.js'

/**
 * Контекст данных каталога.
 * Загружает товары и категории из PHP API (/api/products.php, /api/categories.php).
 * Если API недоступен (локальная разработка или БД не настроена) —
 * использует статические JSON из src/data как запасной вариант.
 */
const DataContext = createContext(null)

const API_BASE = '/api/'

export function DataProvider({ children }) {
  const [products, setProducts] = useState(fallbackProducts)
  const [categories, setCategories] = useState(fallbackCategories)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [pRes, cRes] = await Promise.all([
          fetch(API_BASE + 'products.php').then((r) => r.json()),
          fetch(API_BASE + 'categories.php').then((r) => r.json()),
        ])
        if (cancelled) return
        if (pRes && pRes.ok && Array.isArray(pRes.products)) {
          setProducts(pRes.products)
        }
        if (cRes && cRes.ok && Array.isArray(cRes.categories)) {
          setCategories(cRes.categories)
        }
      } catch (e) {
        // API недоступен — остаёмся на запасных JSON
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <DataContext.Provider value={{ products, categories, faq, loading }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) {
    throw new Error('useData должен использоваться внутри DataProvider')
  }
  return ctx
}
