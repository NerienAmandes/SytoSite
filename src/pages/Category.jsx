import { useParams, Link } from 'react-router-dom'
import { products, categories } from '../data/index.js'
import Card from '../components/Card.jsx'

export default function Category() {
  const { categorySlug } = useParams()

  const category = categories.find(c => c.slug === categorySlug)
  const categoryProducts = products.filter(p => p.category === categorySlug)

  if (!category) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h1>Категория не найдена</h1>
        <p style={{ marginTop: '16px', opacity: 0.7 }}>Похоже, такой страницы в нашей лавке нет.</p>
        <Link to="/catalog" style={{ display: 'inline-block', marginTop: '24px', padding: '12px 24px', background: '#D49A36', color: '#2C241B', textDecoration: 'none', borderRadius: '4px', fontWeight: 600 }}>
          Вернуться в каталог
        </Link>
      </div>
    )
  }

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <nav style={{ fontSize: '14px', opacity: 0.6, marginBottom: '16px' }}>
        <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Главная</Link>
        {' / '}
        <Link to="/catalog" style={{ color: 'inherit', textDecoration: 'none' }}>Каталог</Link>
        {' / '}
        <span>{category.title}</span>
      </nav>

      <h1 style={{ fontSize: '2.5rem', marginBottom: '12px' }}>{category.title}</h1>

      {category.description && (
        <p style={{ fontSize: '1.1rem', opacity: 0.8, maxWidth: '700px', marginBottom: '40px' }}>
          {category.description}
        </p>
      )}

      {categoryProducts.length === 0 ? (
        <p style={{ opacity: 0.7 }}>В этой категории пока нет товаров.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '28px' }}>
          {categoryProducts.map(product => (
            <Card key={product.slug} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}