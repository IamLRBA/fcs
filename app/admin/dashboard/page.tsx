'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Trash2, Package, DollarSign, ShoppingCart, Users, BarChart3, LogOut, X, Image as ImageIcon, Maximize2, Minimize2 } from 'lucide-react'
import { AuthManager } from '@/lib/auth'
import { ProductManager, type Product, type BoughtProduct } from '@/lib/products'
import { OrderManager, type Order } from '@/lib/cart'

const categories = ['shirts', 'tees', 'coats', 'pants-and-shorts', 'footwear', 'accessories']
const subcategoriesMap: Record<string, string[]> = {
  'shirts': ['gentle', 'checked', 'textured', 'denim'],
  'tees': ['plain', 'graphic', 'collared', 'sporty'],
  'coats': ['sweater', 'hoodie', 'coat', 'jacket'],
  'pants-and-shorts': ['gentle', 'denim', 'cargo', 'sporty'],
  'footwear': ['gentle', 'sneakers', 'sandals', 'boots'],
  'accessories': ['rings-necklaces', 'shades-glasses', 'bracelets-watches', 'decor']
}

const conditions = ['Like New', 'Good', 'Fair', 'Worn']

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [showRemoveForm, setShowRemoveForm] = useState(false)
  const [selectedRemoveProduct, setSelectedRemoveProduct] = useState<Product | null>(null)
  const [removeReason, setRemoveReason] = useState<'Product Bought' | 'Mistakenly Posted' | ''>('')
  const [productImages, setProductImages] = useState<string[]>([]) // Base64 images
  const [newProduct, setNewProduct] = useState({
    name: '',
    brand: '',
    category: 'shirts',
    section: 'gentle',
    price_ugx: '',
    original_price: '',
    sizes: [] as string[],
    colors: [] as string[],
    images: [] as string[],
    description: '',
    condition: 'Like New',
    sku: '',
    stock_qty: ''
  })
  const router = useRouter()

  useEffect(() => {
    if (!AuthManager.isAdmin()) {
      router.push('/admin/login')
      return
    }
    setIsAdmin(true)
    loadData()
  }, [router])

  const loadData = () => {
    setProducts(ProductManager.getAllProductsArray())
    setOrders(OrderManager.getOrders())
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        alert('Please select only image files')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setProductImages(prev => [...prev, base64String])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setProductImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (productImages.length === 0) {
      alert('Please add at least one product image')
      return
    }

    const product: Product = {
      id: `${newProduct.category}-${newProduct.section}-${Date.now()}`,
      name: newProduct.name,
      brand: newProduct.brand,
      category: newProduct.category,
      section: newProduct.section,
      price_ugx: parseInt(newProduct.price_ugx),
      original_price: newProduct.original_price ? parseInt(newProduct.original_price) : undefined,
      sizes: newProduct.sizes,
      colors: newProduct.colors,
      images: productImages, // Use uploaded images (first image is main display)
      description: newProduct.description,
      condition: newProduct.condition,
      sku: newProduct.sku || `${newProduct.category.substring(0, 3).toUpperCase()}-${newProduct.section.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-3)}`,
      stock_qty: parseInt(newProduct.stock_qty) || 1
    }

    if (ProductManager.addProduct(product)) {
      alert('Product added successfully!')
      setShowAddForm(false)
      setProductImages([])
      setNewProduct({
        name: '',
        brand: '',
        category: 'shirts',
        section: 'gentle',
        price_ugx: '',
        original_price: '',
        sizes: [],
        colors: [],
        images: [],
        description: '',
        condition: 'Like New',
        sku: '',
        stock_qty: ''
      })
      loadData()
    } else {
      alert('Error adding product')
    }
  }

  const handleDeleteProduct = (productId: string, category: string, section: string, reason: 'Product Bought' | 'Mistakenly Posted') => {
    if (confirm(`Are you sure you want to remove this product? Reason: ${reason}`)) {
      if (ProductManager.deleteProduct(productId, category, section, reason)) {
        alert(`Product removed successfully!${reason === 'Product Bought' ? ' It has been added to bought products.' : ''}`)
        setShowRemoveForm(false)
        setSelectedRemoveProduct(null)
        setRemoveReason('')
        loadData()
      } else {
        alert('Error removing product')
      }
    }
  }

  const handleLogout = () => {
    AuthManager.adminLogout()
    router.push('/')
  }

  if (!isAdmin) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const boughtProducts = ProductManager.getBoughtProducts()
  const stats = {
    totalProducts: products.length,
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
    totalItemsSold: orders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0),
    boughtProducts: boughtProducts.length
  }

  const [showBackButton, setShowBackButton] = useState(true)

  // Show/hide back button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      // Show button when at top (within 100px), hide when scrolled down
      setShowBackButton(scrollTop < 100)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Check initial position
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-unified pt-24 pb-20">
      <div className="container-custom mt-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 sm:mb-8">
          <motion.div
            animate={{ opacity: showBackButton ? 1 : 0, y: showBackButton ? 0 : -20 }}
            transition={{ duration: 0.3 }}
            className="pointer-events-none"
            style={{ pointerEvents: showBackButton ? 'auto' : 'none' }}
          >
            <Link href="/" className="focus-ring-none inline-flex items-center space-x-2 text-primary-600 dark:text-primary-300 hover:text-primary-800 dark:hover:text-primary-100 transition-colors duration-300">
              <span className="text-base font-medium">⟸</span>
              <span className="text-sm font-medium">Back to Home</span>
            </Link>
          </motion.div>
          <button onClick={handleLogout} className="flex items-center space-x-2 text-red-600 hover:text-red-700">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>

        {/* Main container - semi-transparent like account page */}
        <div className="hero-glass-frame relative backdrop-blur-lg w-full rounded-2xl">
          <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
          <div className="relative z-10 bg-neutral-100/80 dark:bg-neutral-800 rounded-2xl shadow-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 p-4 sm:p-6 md:p-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-800 dark:text-primary-100 mb-6 sm:mb-8 text-center sm:text-left">Admin Dashboard</h1>

        {/* Stats - section with darker shades in light mode */}
        <div className="hero-glass-frame relative backdrop-blur-lg rounded-xl sm:rounded-2xl mb-6 sm:mb-8">
          <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
          <div className="relative z-10 p-3 sm:p-4">
            <h2 className="text-lg sm:text-xl font-bold text-primary-800 dark:text-primary-100 mb-4 text-center sm:text-left">Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 justify-items-center sm:justify-items-stretch">
              {/* Total Products */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="hero-glass-frame hero-glass-frame-compact relative backdrop-blur-sm rounded-xl w-full max-w-xs sm:max-w-none text-center sm:text-left"
              >
                <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
                <div className="relative z-10 bg-neutral-200/60 dark:bg-neutral-800 rounded-xl p-4 sm:p-6 shadow-lg border border-neutral-300/80 dark:border-neutral-700">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div>
                      <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">Total Products</p>
                      <p className="text-2xl sm:text-3xl font-bold text-primary-800 dark:text-primary-200">{stats.totalProducts}</p>
                    </div>
                    <Package className="w-10 h-10 sm:w-12 sm:h-12 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                  </div>
                </div>
              </motion.div>

              {/* Total Orders */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="hero-glass-frame hero-glass-frame-compact relative backdrop-blur-sm rounded-xl w-full max-w-xs sm:max-w-none text-center sm:text-left"
              >
                <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
                <div className="relative z-10 bg-neutral-300/50 dark:bg-neutral-800 rounded-xl p-4 sm:p-6 shadow-lg border border-neutral-300/80 dark:border-neutral-700">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div>
                      <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">Total Orders</p>
                      <p className="text-2xl sm:text-3xl font-bold text-primary-800 dark:text-primary-200">{stats.totalOrders}</p>
                    </div>
                    <ShoppingCart className="w-10 h-10 sm:w-12 sm:h-12 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                  </div>
                </div>
              </motion.div>

              {/* Total Revenue */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="hero-glass-frame hero-glass-frame-compact relative backdrop-blur-sm rounded-xl w-full max-w-xs sm:max-w-none text-center sm:text-left"
              >
                <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
                <div className="relative z-10 bg-neutral-200/70 dark:bg-neutral-800 rounded-xl p-4 sm:p-6 shadow-lg border border-neutral-300/80 dark:border-neutral-700">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div>
                      <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">Total Revenue</p>
                      <p className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-800 dark:text-primary-200">
                        UGX {stats.totalRevenue.toLocaleString()}
                      </p>
                    </div>
                    <DollarSign className="w-10 h-10 sm:w-12 sm:h-12 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                  </div>
                </div>
              </motion.div>

              {/* Items Sold */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="hero-glass-frame hero-glass-frame-compact relative backdrop-blur-sm rounded-xl w-full max-w-xs sm:max-w-none text-center sm:text-left"
              >
                <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
                <div className="relative z-10 bg-neutral-300/50 dark:bg-neutral-800 rounded-xl p-4 sm:p-6 shadow-lg border border-neutral-300/80 dark:border-neutral-700">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div>
                      <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">Items Sold</p>
                      <p className="text-2xl sm:text-3xl font-bold text-primary-800 dark:text-primary-200">{stats.totalItemsSold}</p>
                    </div>
                    <BarChart3 className="w-10 h-10 sm:w-12 sm:h-12 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Add Product Button */}
        <div className="mb-4 sm:mb-6 flex justify-center sm:justify-start">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn btn-outline btn-hover-secondary-filled flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>{showAddForm ? 'Cancel' : 'Add New Product'}</span>
          </button>
        </div>

        {/* Add Product Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <div className="hero-glass-frame relative backdrop-blur-lg rounded-xl sm:rounded-2xl">
              <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
              <div className="relative z-10 bg-neutral-200/60 dark:bg-neutral-800 rounded-xl p-4 sm:p-6 md:p-8 shadow-lg border border-neutral-300/80 dark:border-neutral-700">
                <h2 className="text-xl sm:text-2xl font-bold text-primary-800 dark:text-primary-100 mb-4 sm:mb-6 text-center sm:text-left">Add New Product</h2>
                <form onSubmit={handleAddProduct} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg dark:bg-neutral-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Brand *</label>
                  <input
                    type="text"
                    required
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg dark:bg-neutral-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <select
                    required
                    value={newProduct.category}
                    onChange={(e) => {
                      setNewProduct({ ...newProduct, category: e.target.value, section: subcategoriesMap[e.target.value]?.[0] || '' })
                    }}
                    className="w-full px-4 py-3 border rounded-lg dark:bg-neutral-700 dark:text-white"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Subcategory *</label>
                  <select
                    required
                    value={newProduct.section}
                    onChange={(e) => setNewProduct({ ...newProduct, section: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg dark:bg-neutral-700 dark:text-white"
                  >
                    {subcategoriesMap[newProduct.category]?.map(sub => (
                      <option key={sub} value={sub}>{sub.charAt(0).toUpperCase() + sub.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Price (UGX) *</label>
                  <input
                    type="number"
                    required
                    value={newProduct.price_ugx}
                    onChange={(e) => setNewProduct({ ...newProduct, price_ugx: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg dark:bg-neutral-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Original Price (UGX)</label>
                  <input
                    type="number"
                    value={newProduct.original_price}
                    onChange={(e) => setNewProduct({ ...newProduct, original_price: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg dark:bg-neutral-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Sizes (comma-separated) *</label>
                  <input
                    type="text"
                    required
                    placeholder="S, M, L, XL"
                    value={newProduct.sizes.join(', ')}
                    onChange={(e) => setNewProduct({ ...newProduct, sizes: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                    className="w-full px-4 py-3 border rounded-lg dark:bg-neutral-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Colors (comma-separated) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Red, Blue, Black"
                    value={newProduct.colors.join(', ')}
                    onChange={(e) => setNewProduct({ ...newProduct, colors: e.target.value.split(',').map(c => c.trim()).filter(c => c) })}
                    className="w-full px-4 py-3 border rounded-lg dark:bg-neutral-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Condition *</label>
                  <select
                    required
                    value={newProduct.condition}
                    onChange={(e) => setNewProduct({ ...newProduct, condition: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg dark:bg-neutral-700 dark:text-white"
                  >
                    {conditions.map(cond => (
                      <option key={cond} value={cond}>{cond}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={newProduct.stock_qty}
                    onChange={(e) => setNewProduct({ ...newProduct, stock_qty: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg dark:bg-neutral-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">SKU</label>
                  <input
                    type="text"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                    placeholder="Auto-generated if empty"
                    className="w-full px-4 py-3 border rounded-lg dark:bg-neutral-700 dark:text-white"
                  />
                </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Product Images *</label>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">First image will be the main display image. Others will appear as thumbnails in the product modal.</p>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="w-full px-4 py-3 border rounded-lg dark:bg-neutral-700 dark:text-white mb-3"
                    />
                    {productImages.length > 0 && (
                      <div className="grid grid-cols-4 gap-4 mt-4">
                        {productImages.map((img, index) => (
                          <div key={index} className="relative group">
                            <img src={img} alt={`Product image ${index + 1}`} className="w-full h-32 object-cover rounded-lg border-2 border-primary-500" />
                            {index === 0 && (
                              <span className="absolute top-1 left-1 px-2 py-1 bg-primary-600 text-white text-xs rounded">Main</span>
                            )}
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description *</label>
                    <textarea
                      required
                      rows={4}
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg dark:bg-neutral-700 dark:text-white"
                    />
                  </div>
                  <button type="submit" className="btn btn-outline btn-hover-secondary-filled w-full sm:w-auto">
                    Add Product
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        )}

        {/* Remove Product Section */}
        <div className="mb-4 sm:mb-6 flex justify-center sm:justify-start">
          <button
            onClick={() => setShowRemoveForm(!showRemoveForm)}
            className="btn btn-danger flex items-center space-x-2"
          >
            <Trash2 className="w-5 h-5" />
            <span>{showRemoveForm ? 'Cancel' : 'Remove Product'}</span>
          </button>
        </div>

        {showRemoveForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <div className="hero-glass-frame relative backdrop-blur-lg rounded-xl sm:rounded-2xl">
              <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
              <div className="relative z-10 bg-neutral-200/60 dark:bg-neutral-800 rounded-xl p-4 sm:p-6 md:p-8 shadow-lg border border-neutral-300/80 dark:border-neutral-700">
                <h2 className="text-xl sm:text-2xl font-bold text-primary-800 dark:text-primary-100 mb-4 sm:mb-6 text-center sm:text-left">Remove Product</h2>
                <div className="space-y-4 text-center sm:text-left">
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Product *</label>
                    <select
                      value={selectedRemoveProduct?.id || ''}
                      onChange={(e) => {
                        const product = products.find(p => p.id === e.target.value)
                        setSelectedRemoveProduct(product || null)
                      }}
                      className="w-full px-4 py-3 border rounded-lg dark:bg-neutral-700 dark:text-white"
                    >
                      <option value="">Select a product...</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} - {product.category} / {product.section} - UGX {product.price_ugx.toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedRemoveProduct && (
                    <>
                      <div className="p-4 bg-neutral-300/40 dark:bg-neutral-700 rounded-lg">
                        <p className="font-medium">{selectedRemoveProduct.name}</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">{selectedRemoveProduct.brand} • {selectedRemoveProduct.category} / {selectedRemoveProduct.section}</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Price: UGX {selectedRemoveProduct.price_ugx.toLocaleString()}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Reason for Removal *</label>
                        <select
                          value={removeReason}
                          onChange={(e) => setRemoveReason(e.target.value as 'Product Bought' | 'Mistakenly Posted')}
                          className="w-full px-4 py-3 border rounded-lg dark:bg-neutral-700 dark:text-white"
                        >
                          <option value="">Select reason...</option>
                          <option value="Product Bought">Product Bought</option>
                          <option value="Mistakenly Posted">Mistakenly Posted</option>
                        </select>
                      </div>
                      {removeReason && (
                        <button
                          onClick={() => handleDeleteProduct(selectedRemoveProduct.id, selectedRemoveProduct.category, selectedRemoveProduct.section, removeReason)}
                          className="btn btn-danger w-full"
                        >
                          Remove Product
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Products List */}
        <div>
          <div className="hero-glass-frame relative backdrop-blur-lg rounded-xl sm:rounded-2xl">
            <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
            <div className="relative z-10 bg-neutral-200/60 dark:bg-neutral-800 rounded-xl p-4 sm:p-6 md:p-8 shadow-lg border border-neutral-300/80 dark:border-neutral-700">
              <h2 className="text-xl sm:text-2xl font-bold text-primary-800 dark:text-primary-100 mb-4 sm:mb-6 text-center sm:text-left">All Products ({products.length})</h2>
              {products.length === 0 ? (
                <p className="text-neutral-600 dark:text-neutral-400 text-center sm:text-left">No products yet. Add your first product!</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Name</th>
                        <th className="text-left p-4">Category</th>
                        <th className="text-left p-4">Price</th>
                        <th className="text-left p-4">Stock</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id} className="border-b">
                          <td className="p-4">{product.name}</td>
                          <td className="p-4">{product.category} / {product.section}</td>
                          <td className="p-4">UGX {product.price_ugx.toLocaleString()}</td>
                          <td className="p-4">{product.stock_qty}</td>
                          <td className="p-4">
                            <button
                              onClick={() => {
                                setSelectedRemoveProduct(product)
                                setRemoveReason('')
                                setShowRemoveForm(true)
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

          </div>
        </div>
      </div>
    </div>
  )
}

