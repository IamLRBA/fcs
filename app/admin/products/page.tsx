'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Package, Trash2, X, Plus, Pencil, Eye } from 'lucide-react'
import { HiSearch, HiX } from 'react-icons/hi'
import { AuthManager } from '@/lib/auth'
import { ProductManager, type Product } from '@/lib/products'

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

export default function AdminProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [detailsProduct, setDetailsProduct] = useState<Product | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [productImages, setProductImages] = useState<string[]>([])
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
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!AuthManager.isAdmin()) {
      router.push('/admin/login')
      return
    }
    loadProducts()
    const onUpdate = () => loadProducts()
    window.addEventListener('productsUpdated', onUpdate)
    return () => window.removeEventListener('productsUpdated', onUpdate)
  }, [router])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadProducts = () => setProducts(ProductManager.getAllProductsArray())

  const query = searchQuery.toLowerCase().trim()
  const filteredProducts = query
    ? products.filter(p => {
        const text = [p.name, p.brand, p.category, p.section, p.sku].join(' ').toLowerCase()
        return text.includes(query)
      })
    : products
  const suggestions = query ? filteredProducts.slice(0, 8) : []

  const handleDelete = (product: Product, reason: 'Product Bought' | 'Mistakenly Posted') => {
    if (!confirm(`Remove "${product.name}"? Reason: ${reason}`)) return
    if (ProductManager.deleteProduct(product.id, product.category, product.section, reason)) {
      loadProducts()
      setDetailsProduct(null)
      setEditingProduct(null)
    } else {
      alert('Failed to remove product')
    }
  }

  const handleUpdate = (updated: Product) => {
    if (ProductManager.updateProduct(updated)) {
      loadProducts()
      setDetailsProduct(updated)
      setEditingProduct(null)
    } else {
      alert('Failed to update product')
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setImages: (urls: string[]) => void) => {
    const files = Array.from(e.target.files || [])
    files.forEach(file => {
      if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) return
      const reader = new FileReader()
      reader.onloadend = () => setImages(prev => [...prev, reader.result as string])
      reader.readAsDataURL(file)
    })
  }

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault()
    if (productImages.length === 0) {
      alert('Add at least one image')
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
      images: productImages,
      description: newProduct.description,
      condition: newProduct.condition,
      sku: newProduct.sku || `${newProduct.category.slice(0, 3).toUpperCase()}-${newProduct.section.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-3)}`,
      stock_qty: parseInt(newProduct.stock_qty) || 1,
      isActive: true
    }
    if (ProductManager.addProduct(product)) {
      setShowAddModal(false)
      setProductImages([])
      setNewProduct({ name: '', brand: '', category: 'shirts', section: 'gentle', price_ugx: '', original_price: '', sizes: [], colors: [], images: [], description: '', condition: 'Like New', sku: '', stock_qty: '' })
      loadProducts()
    } else {
      alert('Failed to add product')
    }
  }

  const removeImage = (index: number) => setProductImages(prev => prev.filter((_, i) => i !== index))

  return (
    <div className="min-h-screen bg-unified pt-24 pb-20">
      <div className="container-custom mt-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <Link
            href="/admin/dashboard"
            className="focus-ring-none inline-flex items-center gap-2 text-primary-600 dark:text-primary-300 hover:text-primary-800 dark:hover:text-primary-100"
          >
            <span className="text-base font-medium">⟸</span>
            <span className="text-sm font-medium">Back to Dashboard</span>
          </Link>
        </div>

        <div className="hero-glass-frame relative backdrop-blur-lg rounded-2xl overflow-hidden">
          <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
          <div className="relative z-10 bg-neutral-100/80 dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-4 sm:p-6 md:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary-800 dark:text-primary-100 mb-6 text-center">
              Products
            </h1>

            {/* Search - centered, hamburger-menu style */}
            <div className="flex justify-center mb-6" ref={searchRef}>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex items-center w-full max-w-md mx-auto"
              >
                <button
                  type="button"
                  className="focus-ring-none shrink-0 p-2.5 mr-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-primary-700 dark:hover:text-primary-300"
                  aria-label="Search"
                >
                  <HiSearch className="w-5 h-5" />
                </button>
                <div className="search-input-wrapper relative flex-1">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setShowSuggestions(true)
                    }}
                    onFocus={() => searchQuery && setShowSuggestions(true)}
                    className="input-overlay w-full py-2.5 pl-4 pr-10 text-sm border-0 bg-white/80 dark:bg-neutral-800/80 rounded-xl"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => { setSearchQuery(''); setShowSuggestions(false) }}
                      className="focus-ring-none absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                      aria-label="Clear"
                    >
                      <HiX className="w-4 h-4" />
                    </button>
                  )}
                  <AnimatePresence>
                    {showSuggestions && suggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute top-full left-0 right-0 mt-2 w-full hero-glass-frame hero-glass-frame-compact backdrop-blur-lg rounded-lg overflow-hidden z-50"
                      >
                        <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
                        <div className="relative z-10 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 max-h-64 overflow-y-auto">
                          {suggestions.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              className="w-full text-left px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 border-b border-neutral-100 dark:border-neutral-700 last:border-0"
                              onClick={() => {
                                setSearchQuery(p.name)
                                setShowSuggestions(false)
                                setDetailsProduct(p)
                              }}
                            >
                              <span className="text-xs text-neutral-500 dark:text-neutral-400 block">{p.category} • {p.section}</span>
                              <span className="font-medium text-neutral-900 dark:text-neutral-100">{p.name} – {p.brand}</span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </form>
            </div>

            {/* Add product button */}
            <div className="flex justify-center mb-6">
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="btn btn-outline btn-hover-secondary-filled inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add product
              </button>
            </div>

            {/* Table */}
            <div className="hero-glass-frame hero-glass-frame-compact relative backdrop-blur-sm rounded-xl overflow-hidden">
              <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
              <div className="relative z-10 bg-neutral-200/60 dark:bg-neutral-800/80 rounded-xl border border-neutral-300/80 dark:border-neutral-700 overflow-x-auto">
                {filteredProducts.length === 0 ? (
                  <p className="text-center text-neutral-600 dark:text-neutral-400 py-12">No products match your search.</p>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-300/80 dark:border-neutral-600">
                        <th className="text-left p-3 text-sm font-semibold">Image</th>
                        <th className="text-left p-3 text-sm font-semibold">Name</th>
                        <th className="text-left p-3 text-sm font-semibold">Price</th>
                        <th className="text-left p-3 text-sm font-semibold">Stock</th>
                        <th className="text-left p-3 text-sm font-semibold">Label</th>
                        <th className="text-left p-3 text-sm font-semibold">Status</th>
                        <th className="text-left p-3 text-sm font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="border-b border-neutral-200/80 dark:border-neutral-700 hover:bg-neutral-200/40 dark:hover:bg-neutral-700/30">
                          <td className="p-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-700 flex-shrink-0">
                              <img
                                src={product.images?.[0] || '/assets/images/placeholder.jpg'}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).src = '/assets/images/placeholder.jpg' }}
                              />
                            </div>
                          </td>
                          <td className="p-3 font-medium text-neutral-900 dark:text-neutral-100">{product.name}</td>
                          <td className="p-3">UGX {product.price_ugx?.toLocaleString?.() ?? product.price_ugx}</td>
                          <td className="p-3">{product.stock_qty}</td>
                          <td className="p-3 text-primary-700 dark:text-primary-400">{product.brand}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${product.isActive !== false ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-neutral-200 text-neutral-600 dark:bg-neutral-600 dark:text-neutral-300'}`}>
                              {product.isActive !== false ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="p-3 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setDetailsProduct(product)}
                              className="focus-ring-none text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1 text-sm"
                            >
                              <Eye className="w-4 h-4" /> Details
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(product, 'Mistakenly Posted')}
                              className="focus-ring-none text-red-600 hover:text-red-700 p-1"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details modal */}
      <AnimatePresence>
        {detailsProduct && !editingProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setDetailsProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="hero-glass-frame relative backdrop-blur-lg rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden"
            >
              <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
              <div className="relative z-10 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-xl overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
                  <h2 className="text-xl font-bold text-primary-800 dark:text-primary-100">Product details</h2>
                  <button type="button" onClick={() => setDetailsProduct(null)} className="focus-ring-none p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex justify-center">
                    <div className="w-40 h-40 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-700">
                      <img src={detailsProduct.images?.[0] || '/assets/images/placeholder.jpg'} alt={detailsProduct.name} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <p className="font-semibold text-lg text-neutral-900 dark:text-neutral-100">{detailsProduct.name}</p>
                  <p className="text-sm text-primary-700 dark:text-primary-400">{detailsProduct.brand}</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{detailsProduct.category} / {detailsProduct.section}</p>
                  <p className="text-sm">UGX {detailsProduct.price_ugx?.toLocaleString?.()}</p>
                  <p className="text-sm">Stock: {detailsProduct.stock_qty}</p>
                  <p className="text-sm">Condition: {detailsProduct.condition}</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{detailsProduct.description}</p>
                  <p className="text-sm">Status: {detailsProduct.isActive !== false ? 'Active' : 'Inactive'}</p>
                </div>
                <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingProduct({ ...detailsProduct })}
                    className="btn btn-outline btn-hover-secondary-filled inline-flex items-center gap-2"
                  >
                    <Pencil className="w-4 h-4" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(detailsProduct, 'Mistakenly Posted')}
                    className="btn btn-danger inline-flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit modal */}
      <AnimatePresence>
        {editingProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setEditingProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="hero-glass-frame relative backdrop-blur-lg rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden"
            >
              <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
              <div className="relative z-10 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-xl overflow-y-auto max-h-[90vh] p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-primary-800 dark:text-primary-100">Edit product</h2>
                  <button type="button" onClick={() => setEditingProduct(null)} className="focus-ring-none p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); handleUpdate(editingProduct) }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file && file.type.startsWith('image/')) {
                          const reader = new FileReader()
                          reader.onloadend = () => setEditingProduct(prev => prev ? { ...prev, images: [...(prev.images || []).slice(0, 0), reader.result as string, ...(prev.images || []).slice(1)] } : null)
                          reader.readAsDataURL(file)
                        }
                      }}
                      className="w-full text-sm"
                    />
                    {editingProduct.images?.[0] && (
                      <div className="mt-2 w-24 h-24 rounded-lg overflow-hidden">
                        <img src={editingProduct.images[0]} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Name *</label>
                    <input
                      type="text"
                      required
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct(prev => prev ? { ...prev, name: e.target.value } : null)}
                      className="input-overlay w-full px-3 py-2 rounded-lg dark:bg-neutral-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Price (UGX) *</label>
                    <input
                      type="number"
                      required
                      value={editingProduct.price_ugx}
                      onChange={(e) => setEditingProduct(prev => prev ? { ...prev, price_ugx: parseInt(e.target.value) || 0 } : null)}
                      className="input-overlay w-full px-3 py-2 rounded-lg dark:bg-neutral-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Stock *</label>
                    <input
                      type="number"
                      required
                      value={editingProduct.stock_qty}
                      onChange={(e) => setEditingProduct(prev => prev ? { ...prev, stock_qty: parseInt(e.target.value) || 0 } : null)}
                      className="input-overlay w-full px-3 py-2 rounded-lg dark:bg-neutral-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Visible in shop</label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProduct.isActive !== false}
                        onChange={(e) => setEditingProduct(prev => prev ? { ...prev, isActive: e.target.checked } : null)}
                        className="rounded"
                      />
                      <span className="text-sm">Active (show on site)</span>
                    </label>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="btn btn-outline btn-hover-secondary-filled">Save changes</button>
                    <button type="button" onClick={() => setEditingProduct(null)} className="btn btn-outline">Cancel</button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add product modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="hero-glass-frame relative backdrop-blur-lg rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
            >
              <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
              <div className="relative z-10 bg-neutral-100/95 dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-xl overflow-y-auto max-h-[90vh] p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-primary-800 dark:text-primary-100">Add new product</h2>
                  <button type="button" onClick={() => setShowAddModal(false)} className="focus-ring-none p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Name *</label>
                      <input required value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} className="input-overlay w-full px-3 py-2 rounded-lg dark:bg-neutral-700 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Brand *</label>
                      <input required value={newProduct.brand} onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })} className="input-overlay w-full px-3 py-2 rounded-lg dark:bg-neutral-700 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Category *</label>
                      <select required value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value, section: subcategoriesMap[e.target.value]?.[0] || '' })} className="input-overlay w-full px-3 py-2 rounded-lg dark:bg-neutral-700 dark:text-white">
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Subcategory *</label>
                      <select required value={newProduct.section} onChange={(e) => setNewProduct({ ...newProduct, section: e.target.value })} className="input-overlay w-full px-3 py-2 rounded-lg dark:bg-neutral-700 dark:text-white">
                        {subcategoriesMap[newProduct.category]?.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Price (UGX) *</label>
                      <input required type="number" value={newProduct.price_ugx} onChange={(e) => setNewProduct({ ...newProduct, price_ugx: e.target.value })} className="input-overlay w-full px-3 py-2 rounded-lg dark:bg-neutral-700 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Stock *</label>
                      <input required type="number" value={newProduct.stock_qty} onChange={(e) => setNewProduct({ ...newProduct, stock_qty: e.target.value })} className="input-overlay w-full px-3 py-2 rounded-lg dark:bg-neutral-700 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Condition *</label>
                      <select value={newProduct.condition} onChange={(e) => setNewProduct({ ...newProduct, condition: e.target.value })} className="input-overlay w-full px-3 py-2 rounded-lg dark:bg-neutral-700 dark:text-white">
                        {conditions.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Images *</label>
                    <input type="file" accept="image/*" multiple onChange={(e) => handleImageUpload(e, setProductImages)} className="w-full text-sm mb-2" />
                    {productImages.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {productImages.map((img, i) => (
                          <div key={i} className="relative">
                            <img src={img} alt="" className="w-16 h-16 object-cover rounded-lg" />
                            <button type="button" onClick={() => removeImage(i)} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description *</label>
                    <textarea required rows={3} value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} className="input-overlay w-full px-3 py-2 rounded-lg dark:bg-neutral-700 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Sizes (comma-separated)</label>
                    <input value={newProduct.sizes.join(', ')} onChange={(e) => setNewProduct({ ...newProduct, sizes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} className="input-overlay w-full px-3 py-2 rounded-lg dark:bg-neutral-700 dark:text-white" placeholder="S, M, L" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Colors (comma-separated)</label>
                    <input value={newProduct.colors.join(', ')} onChange={(e) => setNewProduct({ ...newProduct, colors: e.target.value.split(',').map(c => c.trim()).filter(Boolean) })} className="input-overlay w-full px-3 py-2 rounded-lg dark:bg-neutral-700 dark:text-white" placeholder="Red, Blue" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="btn btn-outline btn-hover-secondary-filled">Add product</button>
                    <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-outline">Cancel</button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
