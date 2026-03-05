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
  const filtered = query
    ? products.filter(p => {
        const text = [p.name, p.brand, p.category, p.section, p.sku].join(' ').toLowerCase()
        return text.includes(query)
      })
    : products
  const filteredProducts = [...filtered].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setImages: React.Dispatch<React.SetStateAction<string[]>>) => {
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
    <div className="admin-products-page min-h-screen pt-4">
      <div className="container-custom mt-1 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
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
                      <tr className="border-b border-neutral-300/80 dark:border-neutral-600 bg-neutral-300/80 dark:bg-neutral-700/50">
                        <th className="text-left p-3 text-sm font-semibold text-neutral-800 dark:text-neutral-200">No.</th>
                        <th className="text-left p-3 text-sm font-semibold text-neutral-800 dark:text-neutral-200">Image</th>
                        <th className="text-left p-3 text-sm font-semibold text-neutral-800 dark:text-neutral-200">Name</th>
                        <th className="text-left p-3 text-sm font-semibold text-neutral-800 dark:text-neutral-200">Price</th>
                        <th className="text-left p-3 text-sm font-semibold text-neutral-800 dark:text-neutral-200">Stock</th>
                        <th className="text-left p-3 text-sm font-semibold text-neutral-800 dark:text-neutral-200">Label</th>
                        <th className="text-left p-3 text-sm font-semibold text-neutral-800 dark:text-neutral-200">Status</th>
                        <th className="text-left p-3 text-sm font-semibold text-neutral-800 dark:text-neutral-200">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product, index) => (
                        <tr key={product.id} className="border-b border-neutral-200/80 dark:border-neutral-700 hover:bg-neutral-200/40 dark:hover:bg-neutral-700/30">
                          <td className="p-3 text-neutral-600 dark:text-neutral-400">{index + 1}</td>
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
                          <td className="p-3">
                            <button
                              type="button"
                              onClick={() => setDetailsProduct(product)}
                              className="focus-ring-none p-2 rounded-lg text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                              title="Details"
                            >
                              <Eye className="w-5 h-5" />
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

      {/* Details modal – matches product page quick-view (glass + inner card + floating close) */}
      <AnimatePresence>
        {detailsProduct && !editingProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
            onClick={() => setDetailsProduct(null)}
          >
            <div
              className="hero-glass-frame relative w-full max-w-md sm:max-w-3xl md:max-w-5xl backdrop-blur-lg bg-white/25 dark:bg-neutral-900/20 dark:border-neutral-600 rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative z-10 w-full bg-white dark:bg-neutral-800 rounded-tl-2xl rounded-bl-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700 flex flex-col max-h-[70vh] sm:max-h-[80vh] md:max-h-[85vh]"
              >
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDetailsProduct(null)}
                  className="focus-ring-none absolute top-2 right-2 z-20 p-0 w-fit"
                  aria-label="Close"
                >
                  <div className="w-8 h-8 flex items-center justify-center rounded-full border border-neutral-600 dark:border-white/80 hover:border-neutral-900 dark:hover:border-white transition-colors duration-200">
                    <X className="w-4 h-4 text-neutral-600 dark:text-white/80 hover:text-neutral-900 dark:hover:text-white transition-colors duration-200" />
                  </div>
                </motion.button>
                <div className="flex flex-col sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-5 sm:gap-6 pt-10 sm:pt-8 px-4 sm:px-6 md:px-8 pb-4 overflow-y-auto flex-1 min-h-0">
                  <div className="flex-shrink-0">
                    <div className="relative h-56 sm:h-64 md:h-72 bg-neutral-100 dark:bg-primary-900/20 rounded-lg overflow-hidden">
                      <img src={detailsProduct.images?.[0] || '/assets/images/placeholder.jpg'} alt={detailsProduct.name} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="text-primary-700 dark:text-primary-400 text-sm mb-1">{detailsProduct.brand} • {detailsProduct.sku || '—'}</p>
                    <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-primary-50 mb-2">{detailsProduct.name}</h2>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">{detailsProduct.category} / {detailsProduct.section}</p>
                    <p className="text-lg font-semibold text-primary-600 dark:text-primary-300 mb-2">UGX {detailsProduct.price_ugx?.toLocaleString?.()}</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">Stock: {detailsProduct.stock_qty} • Condition: {detailsProduct.condition}</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">Status: {detailsProduct.isActive !== false ? 'Active' : 'Inactive'}</p>
                    {detailsProduct.description && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-3 leading-relaxed">{detailsProduct.description}</p>
                    )}
                  </div>
                </div>
                <div className="pt-4 mt-auto border-t border-neutral-200 dark:border-primary-600/40 px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 flex flex-wrap gap-3 flex-shrink-0">
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
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit modal – matches product page quick-view (glass + inner card + floating close) */}
      <AnimatePresence>
        {editingProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-3 sm:p-4"
            onClick={() => setEditingProduct(null)}
          >
            <div
              className="hero-glass-frame relative w-full max-w-md sm:max-w-3xl md:max-w-5xl backdrop-blur-lg bg-white/25 dark:bg-neutral-900/20 dark:border-neutral-600 rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative z-10 w-full bg-white dark:bg-neutral-800 rounded-tl-2xl rounded-bl-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700 flex flex-col max-h-[70vh] sm:max-h-[80vh] md:max-h-[85vh]"
              >
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEditingProduct(null)}
                  className="focus-ring-none absolute top-2 right-2 z-20 p-0 w-fit"
                  aria-label="Close"
                >
                  <div className="w-8 h-8 flex items-center justify-center rounded-full border border-neutral-600 dark:border-white/80 hover:border-neutral-900 dark:hover:border-white transition-colors duration-200">
                    <X className="w-4 h-4 text-neutral-600 dark:text-white/80 hover:text-neutral-900 dark:hover:text-white transition-colors duration-200" />
                  </div>
                </motion.button>
                <form onSubmit={(e) => { e.preventDefault(); handleUpdate(editingProduct) }} className="flex flex-col min-h-0 flex-1 overflow-hidden">
                  <div className="pt-10 sm:pt-8 px-4 sm:px-6 md:px-8 pb-4 space-y-4 overflow-y-auto flex-1 min-h-0">
                    <h2 className="text-xl font-bold text-primary-800 dark:text-primary-100">Edit product</h2>
                    <div>
                      <label className="block text-sm font-medium mb-1">Image</label>
                      <input
                        id="edit-img"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file && file.type.startsWith('image/')) {
                            const reader = new FileReader()
                            reader.onloadend = () => setEditingProduct(prev => prev ? { ...prev, images: [...(prev.images || []).slice(0, 0), reader.result as string, ...(prev.images || []).slice(1)] } : null)
                            reader.readAsDataURL(file)
                          }
                        }}
                      />
                      <label htmlFor="edit-img" className="btn btn-outline btn-hover-secondary-filled inline-flex items-center gap-2 cursor-pointer">
                        Browse
                      </label>
                      {editingProduct.images?.[0] && (
                        <div className="mt-2 w-24 h-24 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-700">
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
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => setEditingProduct(prev => prev ? { ...prev, price_ugx: Math.max(0, (prev.price_ugx || 0) - 1000) } : null)} className="focus-ring-none w-10 h-10 rounded-lg border border-neutral-300 dark:border-neutral-600 flex items-center justify-center text-lg font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700">−</button>
                        <input
                          type="number"
                          required
                          min={0}
                          value={editingProduct.price_ugx}
                          onChange={(e) => setEditingProduct(prev => prev ? { ...prev, price_ugx: parseInt(e.target.value) || 0 } : null)}
                          className="input-overlay flex-1 px-3 py-2 rounded-lg dark:bg-neutral-700 dark:text-white text-center"
                        />
                        <button type="button" onClick={() => setEditingProduct(prev => prev ? { ...prev, price_ugx: (prev.price_ugx || 0) + 1000 } : null)} className="focus-ring-none w-10 h-10 rounded-lg border border-neutral-300 dark:border-neutral-600 flex items-center justify-center text-lg font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700">+</button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Stock *</label>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => setEditingProduct(prev => prev ? { ...prev, stock_qty: Math.max(0, (prev.stock_qty || 0) - 1) } : null)} className="focus-ring-none w-10 h-10 rounded-lg border border-neutral-300 dark:border-neutral-600 flex items-center justify-center text-lg font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700">−</button>
                        <input
                          type="number"
                          required
                          min={0}
                          value={editingProduct.stock_qty}
                          onChange={(e) => setEditingProduct(prev => prev ? { ...prev, stock_qty: Math.max(0, parseInt(e.target.value) || 0) } : null)}
                          className="input-overlay flex-1 px-3 py-2 rounded-lg dark:bg-neutral-700 dark:text-white text-center"
                        />
                        <button type="button" onClick={() => setEditingProduct(prev => prev ? { ...prev, stock_qty: (prev.stock_qty || 0) + 1 } : null)} className="focus-ring-none w-10 h-10 rounded-lg border border-neutral-300 dark:border-neutral-600 flex items-center justify-center text-lg font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700">+</button>
                      </div>
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
                  </div>
                  <div className="pt-4 border-t border-neutral-200 dark:border-primary-600/40 px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 flex gap-3 flex-shrink-0">
                    <button type="submit" className="btn btn-outline btn-hover-secondary-filled">Save changes</button>
                    <button type="button" onClick={() => setEditingProduct(null)} className="btn btn-outline">Cancel</button>
                  </div>
                </form>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add product modal – matches product page quick-view (glass + inner card + floating close) */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
            onClick={() => setShowAddModal(false)}
          >
            <div
              className="hero-glass-frame relative w-full max-w-md sm:max-w-3xl md:max-w-5xl backdrop-blur-lg bg-white/25 dark:bg-neutral-900/20 dark:border-neutral-600 rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative z-10 w-full bg-white dark:bg-neutral-800 rounded-tl-2xl rounded-bl-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700 flex flex-col max-h-[70vh] sm:max-h-[80vh] md:max-h-[85vh]"
              >
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddModal(false)}
                  className="focus-ring-none absolute top-2 right-2 z-20 p-0 w-fit"
                  aria-label="Close"
                >
                  <div className="w-8 h-8 flex items-center justify-center rounded-full border border-neutral-600 dark:border-white/80 hover:border-neutral-900 dark:hover:border-white transition-colors duration-200">
                    <X className="w-4 h-4 text-neutral-600 dark:text-white/80 hover:text-neutral-900 dark:hover:text-white transition-colors duration-200" />
                  </div>
                </motion.button>
                <form onSubmit={handleAddProduct} className="flex flex-col min-h-0 flex-1 overflow-hidden">
                  <div className="pt-10 sm:pt-8 px-4 sm:px-6 md:px-8 pb-4 space-y-4 overflow-y-auto flex-1 min-h-0">
                    <h2 className="text-xl font-bold text-primary-800 dark:text-primary-100">Add new product</h2>
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
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => setNewProduct(p => ({ ...p, price_ugx: String(Math.max(0, (parseInt(p.price_ugx) || 0) - 1000)) }))} className="focus-ring-none w-10 h-10 rounded-lg border border-neutral-300 dark:border-neutral-600 flex items-center justify-center text-lg font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700">−</button>
                          <input required type="number" min={0} value={newProduct.price_ugx} onChange={(e) => setNewProduct({ ...newProduct, price_ugx: e.target.value })} className="input-overlay flex-1 px-3 py-2 rounded-lg dark:bg-neutral-700 dark:text-white text-center" />
                          <button type="button" onClick={() => setNewProduct(p => ({ ...p, price_ugx: String((parseInt(p.price_ugx) || 0) + 1000) }))} className="focus-ring-none w-10 h-10 rounded-lg border border-neutral-300 dark:border-neutral-600 flex items-center justify-center text-lg font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700">+</button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Stock *</label>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => setNewProduct(p => ({ ...p, stock_qty: String(Math.max(0, (parseInt(p.stock_qty) || 0) - 1)) }))} className="focus-ring-none w-10 h-10 rounded-lg border border-neutral-300 dark:border-neutral-600 flex items-center justify-center text-lg font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700">−</button>
                          <input required type="number" min={0} value={newProduct.stock_qty} onChange={(e) => setNewProduct({ ...newProduct, stock_qty: e.target.value })} className="input-overlay flex-1 px-3 py-2 rounded-lg dark:bg-neutral-700 dark:text-white text-center" />
                          <button type="button" onClick={() => setNewProduct(p => ({ ...p, stock_qty: String((parseInt(p.stock_qty) || 0) + 1) }))} className="focus-ring-none w-10 h-10 rounded-lg border border-neutral-300 dark:border-neutral-600 flex items-center justify-center text-lg font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700">+</button>
                        </div>
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
                      <input id="add-imgs" type="file" accept="image/*" multiple onChange={(e) => handleImageUpload(e, setProductImages)} className="hidden" />
                      <label htmlFor="add-imgs" className="btn btn-outline btn-hover-secondary-filled inline-flex items-center gap-2 cursor-pointer">
                        Browse
                      </label>
                      {productImages.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
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
                  </div>
                  <div className="pt-4 border-t border-neutral-200 dark:border-primary-600/40 px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 flex gap-3 flex-shrink-0">
                    <button type="submit" className="btn btn-outline btn-hover-secondary-filled">Add product</button>
                    <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-outline">Cancel</button>
                  </div>
                </form>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
