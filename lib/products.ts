// lib/products.ts - Product management for admin

export interface Product {
  id: string
  name: string
  brand: string
  category: string
  section: string
  price_ugx: number
  original_price?: number
  sizes: string[]
  colors: string[]
  images: string[]
  description: string
  condition: string
  sku: string
  stock_qty: number
  /**
   * When false, the product is hidden from public listings but remains in the catalog for admins.
   * When undefined, it is treated as active (visible).
   */
  isActive?: boolean
}

export interface BoughtProduct {
  id: string
  product: Product
  reason: 'Product Bought' | 'Mistakenly Posted'
  removedAt: string
}

export class ProductManager {
  private static PRODUCTS_KEY = 'fusioncraft_products'
  private static BOUGHT_PRODUCTS_KEY = 'fusioncraft_bought_products'

  static getProducts(): any {
    if (typeof window === 'undefined') return { products: {} }
    const productsData = localStorage.getItem(this.PRODUCTS_KEY)
    if (productsData) {
      return JSON.parse(productsData)
    }
    // Initialize with default products from JSON file
    return { products: {} }
  }

  static saveProducts(products: any): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.PRODUCTS_KEY, JSON.stringify(products))
    window.dispatchEvent(new CustomEvent('productsUpdated'))
  }

  static addProduct(product: Product): boolean {
    try {
      const productsData = this.getProducts()
      const productToSave: Product = {
        ...product,
        isActive: product.isActive ?? true
      }
      
      if (!productsData.products[productToSave.category]) {
        productsData.products[productToSave.category] = {
          title: productToSave.category.charAt(0).toUpperCase() + productToSave.category.slice(1),
          description: '',
          subcategories: {}
        }
      }
      
      if (!productsData.products[productToSave.category].subcategories[productToSave.section]) {
        productsData.products[productToSave.category].subcategories[productToSave.section] = []
      }
      
      productsData.products[productToSave.category].subcategories[productToSave.section].push(productToSave)
      this.saveProducts(productsData)
      return true
    } catch (error) {
      console.error('Error adding product:', error)
      return false
    }
  }

  static deleteProduct(productId: string, category: string, section: string, reason?: 'Product Bought' | 'Mistakenly Posted'): boolean {
    try {
      const productsData = this.getProducts()
      
      if (productsData.products[category]?.subcategories[section]) {
        const product = productsData.products[category].subcategories[section].find(
          (p: Product) => p.id === productId
        )
        
        if (product && reason === 'Product Bought') {
          // Store as bought product
          const boughtProducts = this.getBoughtProducts()
          boughtProducts.push({
            id: `BOUGHT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            product,
            reason,
            removedAt: new Date().toISOString()
          })
          localStorage.setItem(this.BOUGHT_PRODUCTS_KEY, JSON.stringify(boughtProducts))
        }
        
        productsData.products[category].subcategories[section] = 
          productsData.products[category].subcategories[section].filter(
            (p: Product) => p.id !== productId
          )
        this.saveProducts(productsData)
        return true
      }
      return false
    } catch (error) {
      console.error('Error deleting product:', error)
      return false
    }
  }

  static getBoughtProducts(): BoughtProduct[] {
    if (typeof window === 'undefined') return []
    const boughtProductsData = localStorage.getItem(this.BOUGHT_PRODUCTS_KEY)
    return boughtProductsData ? JSON.parse(boughtProductsData) : []
  }

  static getAllProductsArray(): Product[] {
    const productsData = this.getProducts()
    const allProducts: Product[] = []
    
    Object.keys(productsData.products || {}).forEach(category => {
      Object.keys(productsData.products[category].subcategories || {}).forEach(section => {
        productsData.products[category].subcategories[section].forEach((product: Product) => {
          allProducts.push(product)
        })
      })
    })
    
    return allProducts
  }

  /**
   * Update an existing product in its current category/section.
   * Returns true if the product was found and updated.
   */
  static updateProduct(updatedProduct: Product): boolean {
    try {
      const productsData = this.getProducts()
      const categoryData = productsData.products[updatedProduct.category]
      if (!categoryData || !categoryData.subcategories?.[updatedProduct.section]) {
        return false
      }

      const list: Product[] = categoryData.subcategories[updatedProduct.section]
      const index = list.findIndex((p: Product) => p.id === updatedProduct.id)
      if (index === -1) return false

      // Preserve active flag defaulting to true when omitted
      const nextProduct: Product = {
        ...list[index],
        ...updatedProduct,
        isActive: updatedProduct.isActive ?? list[index].isActive ?? true
      }

      list[index] = nextProduct
      this.saveProducts(productsData)
      return true
    } catch (error) {
      console.error('Error updating product:', error)
      return false
    }
  }
}

