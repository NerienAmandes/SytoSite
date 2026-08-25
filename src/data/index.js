import productsJson from './products.json'
import categoriesJson from './categories.json'

// Защищаемся: работает и с массивом, и с объектом { products: [...] }
export const products = Array.isArray(productsJson)
    ? productsJson
    : productsJson.products || []

export const categories = Array.isArray(categoriesJson)
    ? categoriesJson
    : categoriesJson.categories || []