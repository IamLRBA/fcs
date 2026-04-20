'use client'

import { useState, useEffect, useRef, Fragment } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Package, Trash2, X, Plus, Pencil, Eye, SkipBack, SkipForward, Loader2 } from 'lucide-react'
import { HiSearch, HiX } from 'react-icons/hi'
import { AuthManager } from '@/lib/auth'
import Button from '@/components/ui/Button'
import ModalCloseButton from '@/components/ui/ModalCloseButton'
import FeedbackDialog from '@/components/ui/FeedbackDialog'
import AdminNavHeader from '@/components/admin/AdminNavHeader'
import HorizontalScrollAffordance from '@/components/ui/HorizontalScrollAffordance'
import SafeImage from '@/components/common/SafeImage'
import { Skeleton } from '@/components/ui/Skeleton'
import SegmentedPillNav from '@/components/ui/SegmentedPillNav'
import { SLIDER_SYNC_EDGE_LINE_CLASS } from '@/lib/constants/slider-edge'

interface Product {
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
  isActive?: boolean
}

const categories = ['shirts', 'tees', 'coats', 'pants-and-shorts', 'footwear', 'accessories']
const subcategoriesMap: Record<string, string[]> = {
  'shirts': ['gentle', 'checked', 'textured', 'denim'],
  'tees': ['plain', 'graphic', 'collared', 'sporty'],
  'coats': ['sweater', 'hoodie', 'coat', 'jacket'],
  'pants-and-shorts': ['gentle', 'denim', 'cargo', 'sporty'],
  'footwear': ['gentle', 'sneakers', 'sandals', 'boots'],
  'accessories': ['rings-necklaces', 'shades-glasses', 'bracelets-watches', 'decor']
}
const subcategoryDisplayMap: Record<string, string> = {
  'rings-necklaces': 'Headwear',
  'shades-glasses': 'Eyewear',
  'bracelets-watches': 'Wristwear',
  decor: 'More',
}
const formatSubcategoryLabel = (slug: string) =>
  subcategoryDisplayMap[slug] ??
  slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
const conditions = ['Perfect', 'New', 'Like New', 'Good']
const PAGE_SIZE = 10
const ADMIN_FILTER_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'shirts', label: 'Shirts' },
  { id: 'tees', label: 'Tees' },
  { id: 'coats', label: 'Outerwear' },
  { id: 'pants-and-shorts', label: 'Bottoms' },
  { id: 'footwear', label: 'Footwear' },
  { id: 'accessories', label: 'Accessories' },
] as const
const ADMIN_FILTER_TOP = ADMIN_FILTER_CATEGORIES.slice(0, 3)
const ADMIN_FILTER_BOTTOM = ADMIN_FILTER_CATEGORIES.slice(3)

type RemovalReasonKey = 'PRODUCT_BOUGHT' | 'MISTAKENLY_POSTED' | 'DISCONTINUED'

const DELETE_REASON_OPTIONS: { key: RemovalReasonKey; label: string; description: string }[] = [
  {
    key: 'PRODUCT_BOUGHT',
    label: 'Sold / purchased',
    description: 'The piece was bought; remove it from the catalog.',
  },
  {
    key: 'MISTAKENLY_POSTED',
    label: 'Mistakenly posted',
    description: 'Listed by mistake or with incorrect details.',
  },
  {
    key: 'DISCONTINUED',
    label: 'Discontinued',
    description: 'No longer offered or replaced in the collection.',
  },
]

const ICON_BTN_RED =
  'w-10 h-10 !border-red-400 !text-red-400 hover:!bg-red-500/20 hover:!text-red-300 dark:!border-red-400 dark:!text-red-400 dark:hover:!bg-red-500/20 dark:hover:!text-red-300'

/** Matches category grid card: badge on image top-left, sale + struck original under (ProductGridCard). */
function AdminShopCardDiscountPreview({ saleUgx, originalUgx }: { saleUgx: number; originalUgx: number }) {
  if (!Number.isFinite(saleUgx) || !Number.isFinite(originalUgx) || originalUgx <= saleUgx) return null
  const pct = Math.round(((originalUgx - saleUgx) / originalUgx) * 100)
  return (
    <div className="mt-2 rounded-md border border-primary-500/30 bg-primary-800/30 p-2 dark:border-primary-500/40">
      <p className="mb-1.5 text-[11px] font-medium text-primary-800 dark:text-primary-200">Shop card preview</p>
      <div className="relative mx-auto aspect-square w-full max-w-[7.5rem] overflow-hidden rounded-lg bg-primary-900/20">
        <div className="absolute left-1.5 top-1.5 z-30 rounded-full bg-accent-500 px-1.5 py-0.5 text-[10px] font-bold text-white sm:text-xs">
          {pct}% OFF
        </div>
      </div>
      <div className="mt-1 flex flex-wrap items-center justify-center gap-x-1 gap-y-0 px-0.5 pt-0 text-center">
        <span className="text-[11px] font-bold text-primary-600 dark:text-primary-300 sm:text-xs">
          UGX {saleUgx.toLocaleString()}
        </span>
        <span className="text-[10px] leading-none text-neutral-600 line-through dark:text-neutral-400 sm:text-[11px]">
          UGX {originalUgx.toLocaleString()}
        </span>
      </div>
    </div>
  )
}

export default function AdminProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<(typeof ADMIN_FILTER_CATEGORIES)[number]['id']>('all')
  const [detailsProduct, setDetailsProduct] = useState<Product | null>(null)
  const [detailsImageIndex, setDetailsImageIndex] = useState(0)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [draggingImageIndex, setDraggingImageIndex] = useState<number | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [deleteReason, setDeleteReason] = useState<RemovalReasonKey>('MISTAKENLY_POSTED')
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [undoDeletedProduct, setUndoDeletedProduct] = useState<Product | null>(null)
  const [undoBusy, setUndoBusy] = useState(false)
  const [productImages, setProductImages] = useState<string[]>([])
  /** Brief spinner on thumbnail remove (add modal). */
  const [addRemovingIndex, setAddRemovingIndex] = useState<number | null>(null)
  /** Brief spinner on thumbnail remove (edit modal strip). */
  const [editThumbRemovingIndex, setEditThumbRemovingIndex] = useState<number | null>(null)
  const [addSubmitting, setAddSubmitting] = useState(false)
  const [updateSubmitting, setUpdateSubmitting] = useState(false)
  const [addImageRequiredOpen, setAddImageRequiredOpen] = useState(false)
  const [feedback, setFeedback] = useState<{ open: boolean; message: string; variant: 'success' | 'error' }>({
    open: false,
    message: '',
    variant: 'error',
  })
  const [detailsLoadingId, setDetailsLoadingId] = useState<string | null>(null)
  const [tablePage, setTablePage] = useState(1)
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
    condition: 'Perfect',
    sku: '',
    stock_qty: ''
  })
  const searchRef = useRef<HTMLDivElement>(null)
  const draggingImageIndexRef = useRef<number | null>(null)
  /** Tracks which thumbnail index is being moved under the finger (refs avoid stale closures in pointermove). */
  const touchDraggingImageIndexRef = useRef<number | null>(null)
  /** Add-product modal image strip (only one of add/edit modals is open). */
  const touchDraggingNewImageIndexRef = useRef<number | null>(null)
  const draggingNewImageIndexRef = useRef<number | null>(null)

  const REMOVE_IMAGE_SPIN_MS = 320
  const showErrorFeedback = (message: string) => {
    setFeedback({ open: true, message, variant: 'error' })
  }

  useEffect(() => {
    if (!AuthManager.isAdmin()) {
      router.push('/admin/login')
      return
    }
    loadProducts()
  }, [router])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        // no-op: suggestions disabled for table-driven search
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadProducts = async () => {
    setProductsLoading(true)
    try {
      const res = await fetch('/api/products?includeInactive=1&firstImageOnly=1', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load products')
      const data: Product[] = await res.json()
      setProducts(data)
    } catch (error) {
      console.error('Error loading products:', error)
      setProducts([])
    } finally {
      setProductsLoading(false)
    }
  }

  const openProductDetails = async (product: Product) => {
    setDetailsLoadingId(product.id)
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(product.id)}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load product')
      const full: Product = await res.json()
      setDetailsProduct(full)
    } catch {
      showErrorFeedback('Could not load product details. Please try again.')
    } finally {
      setDetailsLoadingId(null)
    }
  }

  const query = searchQuery.toLowerCase().trim()
  const categoryFiltered =
    selectedCategoryFilter === 'all'
      ? products
      : products.filter((p) => p.category === selectedCategoryFilter)
  const filtered = query
    ? categoryFiltered.filter(p => {
        const text = [p.name, p.brand, p.category, p.section, p.sku].join(' ').toLowerCase()
        return text.includes(query)
      })
    : categoryFiltered
  const filteredProducts = [...filtered].sort((a, b) => (a.name || '').localeCompare(b.name || ''))

  const totalTablePages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE))
  const safeTablePage = Math.min(tablePage, totalTablePages)
  const pageProducts = filteredProducts.slice((safeTablePage - 1) * PAGE_SIZE, safeTablePage * PAGE_SIZE)

  useEffect(() => {
    setTablePage(1)
  }, [searchQuery, selectedCategoryFilter])

  const selectThemeClass =
    'input-overlay w-full rounded-lg border border-primary-300/60 bg-primary-50/80 px-3 py-2 text-primary-900 dark:border-primary-500/40 dark:bg-neutral-800/80 dark:text-primary-100'

  useEffect(() => {
    if (tablePage > totalTablePages) setTablePage(totalTablePages)
  }, [tablePage, totalTablePages])

  useEffect(() => {
    setDetailsImageIndex(0)
  }, [detailsProduct?.id])

  useEffect(() => {
    if (!editingProduct) setEditThumbRemovingIndex(null)
  }, [editingProduct])

  useEffect(() => {
    if (!showAddModal) setAddRemovingIndex(null)
  }, [showAddModal])

  useEffect(() => {
    setDeleteReason('MISTAKENLY_POSTED')
  }, [deleteTarget?.id])

  const removeEditingImage = (index: number) => {
    setEditingProduct((prev) => {
      if (!prev) return prev
      const nextImages = (prev.images || []).filter((_, i) => i !== index)
      return { ...prev, images: nextImages }
    })
  }

  const reorderEditingImages = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return
    setEditingProduct((prev) => {
      if (!prev) return prev
      const images = [...(prev.images || [])]
      if (!images[fromIndex] || !images[toIndex]) return prev
      const [moved] = images.splice(fromIndex, 1)
      images.splice(toIndex, 0, moved)
      return { ...prev, images }
    })
  }

  const reorderProductImages = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return
    setProductImages((prev) => {
      const images = [...prev]
      if (!images[fromIndex] || !images[toIndex]) return prev
      const [moved] = images.splice(fromIndex, 1)
      images.splice(toIndex, 0, moved)
      return images
    })
  }

  const removeProductImageWithSpin = (index: number) => {
    if (addRemovingIndex !== null) return
    setAddRemovingIndex(index)
    window.setTimeout(() => {
      setProductImages((prev) => prev.filter((_, i) => i !== index))
      setAddRemovingIndex(null)
    }, REMOVE_IMAGE_SPIN_MS)
  }

  const removeEditThumbWithSpin = (index: number) => {
    if (editThumbRemovingIndex !== null) return
    setEditThumbRemovingIndex(index)
    window.setTimeout(() => {
      removeEditingImage(index)
      setEditThumbRemovingIndex(null)
    }, REMOVE_IMAGE_SPIN_MS)
  }

  const performDelete = (product: Product, reason: RemovalReasonKey) => {
    setDeleteBusy(true)
    const deletedSnapshot = { ...product }
    fetch(`/api/products/${product.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to remove product')
        return loadProducts()
      })
      .then(() => {
        setDeleteTarget(null)
        setDetailsProduct(null)
        setEditingProduct(null)
        setUndoDeletedProduct(deletedSnapshot)
      })
      .catch(() => showErrorFeedback('Failed to remove product. Please try again.'))
      .finally(() => setDeleteBusy(false))
  }

  const undoDeleteProduct = async () => {
    if (!undoDeletedProduct) return
    setUndoBusy(true)
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(undoDeletedProduct),
      })
      if (!res.ok) throw new Error('Failed to restore product')
      await loadProducts()
      setUndoDeletedProduct(null)
    } catch {
      showErrorFeedback('Failed to undo deletion. Please try again.')
    } finally {
      setUndoBusy(false)
    }
  }

  const handleUpdate = (updated: Product) => {
    if (updateSubmitting) return
    const sale = updated.price_ugx
    const orig = updated.original_price
    const payload: Product = {
      ...updated,
      original_price: orig != null && Number(orig) > sale ? orig : undefined,
    }
    setUpdateSubmitting(true)
    fetch(`/api/products/${payload.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to update product')
        return res.json()
      })
      .then((saved: Product) => {
        loadProducts()
        setDetailsProduct(saved)
        setEditingProduct(null)
      })
      .catch(() => showErrorFeedback('Failed to update product. Please try again.'))
      .finally(() => setUpdateSubmitting(false))
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
    if (addSubmitting) return
    if (productImages.length === 0) {
      setAddImageRequiredOpen(true)
      return
    }
    const sale = parseInt(newProduct.price_ugx, 10)
    const originalParsed = parseInt(newProduct.original_price, 10)
    const original_price =
      Number.isFinite(originalParsed) && originalParsed > sale ? originalParsed : undefined

    const product: Product = {
      id: `${newProduct.category}-${newProduct.section}-${Date.now()}`,
      name: newProduct.name,
      brand: newProduct.brand,
      category: newProduct.category,
      section: newProduct.section,
      price_ugx: sale,
      original_price,
      sizes: newProduct.sizes,
      colors: newProduct.colors,
      images: productImages,
      description: newProduct.description,
      condition: newProduct.condition,
      sku: newProduct.sku || `${newProduct.category.slice(0, 3).toUpperCase()}-${newProduct.section.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-3)}`,
      stock_qty: parseInt(newProduct.stock_qty) || 1,
      isActive: true
    }
    setAddSubmitting(true)
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to add product')
        setShowAddModal(false)
        setProductImages([])
        setNewProduct({ name: '', brand: '', category: 'shirts', section: 'gentle', price_ugx: '', original_price: '', sizes: [], colors: [], images: [], description: '', condition: 'Perfect', sku: '', stock_qty: '' })
        return loadProducts()
      })
      .catch(() => showErrorFeedback('Failed to add product. Please try again.'))
      .finally(() => setAddSubmitting(false))
  }

  return (
    <div className="admin-products-page min-h-screen pt-4">
      <div className="mt-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdminNavHeader
          title="Product Management"
          subtitle="Manage catalog items, inventory status, and product details"
        />
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
                    }}
                    className="input-overlay w-full py-2.5 pl-4 pr-10 text-sm border-0 bg-white/80 dark:bg-neutral-800/80 rounded-xl"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => { setSearchQuery('') }}
                      className="focus-ring-none absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                      aria-label="Clear"
                    >
                      <HiX className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Add product button */}
            <div className="flex justify-center mb-6">
              <Button
                type="button"
                variant="default"
                size="md"
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add product
              </Button>
            </div>

            <div className="mb-6 mx-auto flex w-full max-w-2xl flex-col items-center gap-2 px-1">
              <div className="w-full max-w-lg">
                <SegmentedPillNav
                  items={ADMIN_FILTER_TOP}
                  value={
                    ADMIN_FILTER_TOP.some((x) => x.id === selectedCategoryFilter)
                      ? selectedCategoryFilter
                      : null
                  }
                  onSelect={(id) => setSelectedCategoryFilter(id as (typeof ADMIN_FILTER_CATEGORIES)[number]['id'])}
                  className="!max-w-none"
                />
              </div>
              <div className="w-full max-w-xl">
                <SegmentedPillNav
                  items={ADMIN_FILTER_BOTTOM}
                  value={
                    ADMIN_FILTER_BOTTOM.some((x) => x.id === selectedCategoryFilter)
                      ? selectedCategoryFilter
                      : null
                  }
                  onSelect={(id) => setSelectedCategoryFilter(id as (typeof ADMIN_FILTER_CATEGORIES)[number]['id'])}
                  className="!max-w-none"
                />
              </div>
            </div>

            {/* Table */}
            <div className="rounded-bl-lg rounded-br-lg border border-neutral-300/80 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
                {productsLoading ? (
                  <div className="space-y-2 px-3 py-3">
                    <Skeleton className="h-10 w-full rounded-lg" />
                    {Array.from({ length: 6 }).map((_, idx) => (
                      <Skeleton key={`products-skeleton-${idx}`} className="h-14 w-full rounded-lg" />
                    ))}
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="overflow-x-auto">
                    <p className="text-center text-neutral-600 dark:text-neutral-400 py-12 px-2">
                      {query ? 'No products match your search.' : 'No products available yet.'}
                    </p>
                  </div>
                ) : (
                  <>
                  <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-neutral-300/80 dark:bg-neutral-700/50">
                        <th className="text-left py-2 px-2 text-sm font-semibold text-neutral-800 dark:text-neutral-200">No.</th>
                        <th className="text-left py-2 px-2 text-sm font-semibold text-neutral-800 dark:text-neutral-200">Image</th>
                        <th className="text-left py-2 px-2 text-sm font-semibold text-neutral-800 dark:text-neutral-200">Name</th>
                        <th className="text-left py-2 px-2 text-sm font-semibold text-neutral-800 dark:text-neutral-200">Price</th>
                        <th className="text-left py-2 px-2 text-sm font-semibold text-neutral-800 dark:text-neutral-200">Stock</th>
                        <th className="text-left py-2 px-2 text-sm font-semibold text-neutral-800 dark:text-neutral-200">Label</th>
                        <th className="text-left py-2 px-2 text-sm font-semibold text-neutral-800 dark:text-neutral-200">Status</th>
                        <th className="text-left py-2 px-2 text-sm font-semibold text-neutral-800 dark:text-neutral-200">Actions</th>
                      </tr>
                      <tr aria-hidden>
                        <th colSpan={8} className="p-0 font-normal border-0">
                          <div className="h-px w-full bg-gradient-to-r from-transparent via-neutral-400/90 dark:via-neutral-500 to-transparent" />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageProducts.map((product, index) => (
                        <Fragment key={product.id}>
                        <tr className="hover:bg-neutral-200/40 dark:hover:bg-neutral-700/30">
                          <td className="py-2 px-2 text-neutral-600 dark:text-neutral-400 text-sm">{(safeTablePage - 1) * PAGE_SIZE + index + 1}</td>
                          <td className="py-2 px-2">
                            <div className="w-11 h-11 rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-700 flex-shrink-0">
                              <img
                                src={product.images?.[0] || '/assets/images/placeholder.jpg'}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).src = '/assets/images/placeholder.jpg' }}
                              />
                            </div>
                          </td>
                          <td className="py-2 px-2 font-medium text-neutral-900 dark:text-neutral-100 text-sm">{product.name}</td>
                          <td className="py-2 px-2 text-sm">UGX {product.price_ugx?.toLocaleString?.() ?? product.price_ugx}</td>
                          <td className="py-2 px-2 text-sm">{product.stock_qty}</td>
                          <td className="py-2 px-2 text-primary-700 dark:text-primary-400 text-sm">{product.brand}</td>
                          <td className="py-2 px-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${product.isActive !== false ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-neutral-200 text-neutral-600 dark:bg-neutral-600 dark:text-neutral-300'}`}>
                              {product.isActive !== false ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-2 px-2">
                            <button
                              type="button"
                              disabled={detailsLoadingId !== null}
                              onClick={() => void openProductDetails(product)}
                              className="focus-ring-none p-1.5 rounded-lg text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                              title="Details"
                            >
                              {detailsLoadingId === product.id ? (
                                <Loader2 className="w-[18px] h-[18px] animate-spin" aria-hidden />
                              ) : (
                                <Eye className="w-[18px] h-[18px]" />
                              )}
                            </button>
                          </td>
                        </tr>
                        {index < pageProducts.length - 1 ? (
                          <tr aria-hidden className="pointer-events-none">
                            <td colSpan={8} className="py-0 px-0 border-0">
                              <div className="h-px w-full bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-600 to-transparent" />
                            </td>
                          </tr>
                        ) : null}
                        </Fragment>
                      ))}
                    </tbody>
                  </table>
                  </div>
                  <div className="flex items-center justify-center gap-6 py-3 border-t border-neutral-200/80 dark:border-neutral-700">
                    <button
                      type="button"
                      disabled={safeTablePage <= 1}
                      onClick={() => setTablePage((p) => Math.max(1, p - 1))}
                      className="focus-ring-none focus:outline-none text-neutral-500 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 disabled:opacity-30 disabled:pointer-events-none transition-colors duration-300"
                      aria-label="Previous page"
                    >
                      <SkipBack className="w-5 h-5" strokeWidth={2} />
                    </button>
                    <span className="text-xs text-neutral-600 dark:text-neutral-400 tabular-nums">
                      {safeTablePage} / {totalTablePages}
                    </span>
                    <button
                      type="button"
                      disabled={safeTablePage >= totalTablePages}
                      onClick={() => setTablePage((p) => Math.min(totalTablePages, p + 1))}
                      className="focus-ring-none focus:outline-none text-neutral-500 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 disabled:opacity-30 disabled:pointer-events-none transition-colors duration-300"
                      aria-label="Next page"
                    >
                      <SkipForward className="w-5 h-5" strokeWidth={2} />
                    </button>
                  </div>
                  </>
                )}
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
            className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm dark:bg-black/80 sm:p-4"
            onClick={() => setDetailsProduct(null)}
          >
            <div
              className="hero-glass-frame relative w-full max-w-md sm:max-w-3xl md:max-w-5xl backdrop-blur-lg bg-white/25 dark:bg-neutral-900/20 dark:border-neutral-600 rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
              <ModalCloseButton onClose={() => setDetailsProduct(null)} className="absolute top-2 right-2 z-40 flex-shrink-0" aria-label="Close" />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative z-10 flex w-full max-h-[70vh] flex-col overflow-hidden rounded-bl-2xl rounded-tl-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-800 sm:max-h-[80vh] md:max-h-[85vh]"
              >
                <div className="modal-scroll flex flex-1 min-h-0 flex-col overflow-y-auto gap-5 pt-10 pb-4 px-4 sm:pt-8 sm:px-6 md:px-8 sm:gap-6">
                <div className="flex flex-col sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-5 sm:gap-6">
                  <div className="flex-shrink-0">
                    <div className="relative mx-auto w-full max-w-[22rem] aspect-square overflow-hidden rounded-lg bg-neutral-100 dark:bg-primary-900/20">
                      <span className="absolute inset-2 overflow-hidden rounded-md bg-neutral-50 dark:bg-neutral-900/50">
                        <SafeImage
                          src={detailsProduct.images?.[detailsImageIndex] || detailsProduct.images?.[0] || '/assets/images/placeholder.jpg'}
                          alt={detailsProduct.name}
                          fill
                          className="object-contain object-center"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 700px"
                        />
                      </span>
                    </div>
                    {(detailsProduct.images?.length || 0) > 1 && (
                      <HorizontalScrollAffordance
                        showEdgeFades={false}
                        syncScrollEdgeLines
                        hideScrollbar
                        className="mx-auto w-full max-w-[22rem] pt-2"
                        scrollClassName="py-3"
                        scrollAriaLabel="Admin product image thumbnails"
                        syncScrollEdgeLineClassName={SLIDER_SYNC_EDGE_LINE_CLASS}
                      >
                        <div className="flex min-h-[1px] min-w-full w-max flex-row items-center justify-center gap-2 px-1 md:gap-3">
                          {detailsProduct.images.map((img, index) => {
                            const isActive = detailsImageIndex === index
                            return (
                              <button
                                key={`${detailsProduct.id}-thumb-${index}`}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => setDetailsImageIndex(index)}
                                aria-current={isActive ? 'true' : undefined}
                                className={`focus-ring-none relative aspect-square w-[calc((100vw-5rem)/4)] max-w-[5.25rem] flex-shrink-0 overflow-hidden rounded-xl border bg-neutral-100 transition-all duration-200 sm:max-w-none sm:w-16 md:w-[4.75rem] dark:bg-neutral-800/40 ${
                                  isActive
                                    ? 'z-[1] border-2 border-primary-600 shadow-md dark:border-primary-400'
                                    : 'border-neutral-300/90 hover:border-primary-400/70 dark:border-neutral-600 dark:hover:border-primary-500/60'
                                }`}
                              >
                                <span className="absolute inset-0 overflow-hidden rounded-[inherit] bg-neutral-50 dark:bg-neutral-900/50">
                                  <SafeImage
                                    src={img}
                                    alt={`${detailsProduct.name} ${index + 1}`}
                                    fill
                                    className="object-contain object-center"
                                    sizes="80px"
                                    loading="lazy"
                                  />
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </HorizontalScrollAffordance>
                    )}
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
                </div>
                <div className="pt-4 mt-auto flex flex-shrink-0 flex-wrap items-center justify-center gap-3 border-t border-neutral-200 px-4 pb-4 dark:border-primary-600/40 sm:px-6 sm:pb-6 md:px-8">
                  <Button
                    type="button"
                    variant="default"
                    size="icon"
                    onClick={() => {
                      const p = detailsProduct
                      const sectionOpts = subcategoriesMap[p.category] ?? []
                      const section = sectionOpts.includes(p.section) ? p.section : sectionOpts[0] ?? p.section
                      setEditingProduct({
                        ...p,
                        section,
                        condition: conditions.includes(p.condition) ? p.condition : conditions[0],
                        sizes: p.sizes ?? [],
                        colors: p.colors ?? [],
                        brand: p.brand ?? '',
                        description: p.description ?? '',
                        sku: p.sku ?? '',
                      })
                    }}
                    className="focus-ring-none h-10 w-10"
                    aria-label="Edit product"
                  >
                    <Pencil className="h-5 w-5" />
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    size="icon"
                    onClick={() => setDeleteTarget(detailsProduct)}
                    className={`focus-ring-none h-10 w-10 ${ICON_BTN_RED}`}
                    aria-label="Remove product"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
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
            className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm dark:bg-black/80 sm:p-4"
            onClick={() => {
              if (!updateSubmitting) setEditingProduct(null)
            }}
          >
            <div
              className="hero-glass-frame relative w-full max-w-md sm:max-w-3xl md:max-w-5xl backdrop-blur-lg bg-white/25 dark:bg-neutral-900/20 dark:border-neutral-600 rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
              <ModalCloseButton
                onClose={() => {
                  if (!updateSubmitting) setEditingProduct(null)
                }}
                className="absolute top-2 right-2 z-40 flex-shrink-0"
                aria-label="Close"
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative z-10 flex w-full max-h-[70vh] flex-col overflow-hidden rounded-bl-2xl rounded-tl-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-800 sm:max-h-[80vh] md:max-h-[85vh]"
              >
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (updateSubmitting) return
                    handleUpdate(editingProduct)
                  }}
                  className="flex flex-col min-h-0 flex-1 overflow-hidden"
                >
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
                            reader.onloadend = () =>
                              setEditingProduct(prev => {
                                if (!prev) return prev
                                return { ...prev, images: [...(prev.images || []), reader.result as string] }
                              })
                            reader.readAsDataURL(file)
                          }
                          // Allow selecting the same file consecutively.
                          e.currentTarget.value = ''
                        }}
                      />
                      <Button type="button" variant="default" size="sm" onClick={() => document.getElementById('edit-img')?.click()} className="inline-flex items-center gap-2">
                        Browse
                      </Button>
                      {(editingProduct.images?.length || 0) > 0 && (
                        <>
                          <div className="mt-3 relative mr-auto w-full max-w-[14rem] aspect-square overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-700">
                            <SafeImage
                              src={editingProduct.images?.[0]}
                              alt="Selected preview"
                              fill
                              className="object-contain object-center"
                              sizes="224px"
                              loading="lazy"
                            />
                        </div>
                          <HorizontalScrollAffordance
                            showEdgeFades={false}
                            syncScrollEdgeLines
                            syncScrollEdgeLineClassName={SLIDER_SYNC_EDGE_LINE_CLASS}
                            hideScrollbar
                            className="pt-2"
                            scrollClassName="py-3"
                            scrollAriaLabel="Edit product images"
                          >
                            <div className="flex min-h-[1px] min-w-full w-max flex-row items-center justify-start gap-2 px-1 md:gap-3">
                              {editingProduct.images.map((img, index) => {
                                  const isActive = index === 0
                                  return (
                                    <div
                                      key={`${img}-${index}`}
                                      role="button"
                                      tabIndex={0}
                                      draggable
                                      data-edit-thumb-index={index}
                                      onPointerDown={(e) => {
                                        if (e.pointerType !== 'touch') return
                                        touchDraggingImageIndexRef.current = index
                                        try {
                                          e.currentTarget.setPointerCapture(e.pointerId)
                                        } catch {
                                          /* pointer capture unsupported */
                                        }
                                      }}
                                      onPointerMove={(e) => {
                                        if (e.pointerType !== 'touch') return
                                        if (touchDraggingImageIndexRef.current === null) return
                                        const under = document.elementFromPoint(e.clientX, e.clientY)
                                        if (!under) return
                                        const thumb = under.closest('[data-edit-thumb-index]') as HTMLElement | null
                                        if (!thumb) return
                                        const raw = thumb.getAttribute('data-edit-thumb-index')
                                        if (raw == null) return
                                        const targetIndex = Number.parseInt(raw, 10)
                                        if (!Number.isFinite(targetIndex)) return
                                        const from = touchDraggingImageIndexRef.current
                                        if (from === targetIndex) return
                                        reorderEditingImages(from, targetIndex)
                                        touchDraggingImageIndexRef.current = targetIndex
                                      }}
                                      onPointerUp={(e) => {
                                        if (e.pointerType !== 'touch') return
                                        touchDraggingImageIndexRef.current = null
                                        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                                          e.currentTarget.releasePointerCapture(e.pointerId)
                                        }
                                      }}
                                      onPointerCancel={(e) => {
                                        if (e.pointerType !== 'touch') return
                                        touchDraggingImageIndexRef.current = null
                                        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                                          e.currentTarget.releasePointerCapture(e.pointerId)
                                        }
                                      }}
                                      onDragStart={() => {
                                        draggingImageIndexRef.current = index
                                        setDraggingImageIndex(index)
                                      }}
                                      onDragOver={(e) => e.preventDefault()}
                                      onDrop={(e) => {
                                        e.preventDefault()
                                        const sourceIndex = draggingImageIndexRef.current ?? draggingImageIndex
                                        if (sourceIndex === null) return
                                        reorderEditingImages(sourceIndex, index)
                                        draggingImageIndexRef.current = null
                                        setDraggingImageIndex(null)
                                      }}
                                      onDragEnd={() => {
                                        draggingImageIndexRef.current = null
                                        setDraggingImageIndex(null)
                                      }}
                                      aria-current={isActive ? 'true' : undefined}
                                      className={`focus-ring-none relative aspect-square w-[calc((100vw-5rem)/4)] max-w-[5.25rem] flex-shrink-0 cursor-grab overflow-hidden rounded-xl border bg-neutral-100 transition-all duration-200 active:cursor-grabbing sm:max-w-none sm:w-12 md:w-14 dark:bg-neutral-800/40 touch-none ${
                                        isActive
                                          ? 'z-[1] border-2 border-primary-600 shadow-md dark:border-primary-400'
                                          : 'border-neutral-300/90 hover:border-primary-400/70 dark:border-neutral-600 dark:hover:border-primary-500/60'
                                      }`}
                                    >
                                      <span className="absolute inset-0 overflow-hidden rounded-[inherit] bg-neutral-50 dark:bg-neutral-900/50">
                                        <SafeImage
                                          src={img}
                                          alt={`Edit image ${index + 1}`}
                                          fill
                                          className="object-contain object-center"
                                          sizes="64px"
                                          loading="lazy"
                                        />
                                      </span>
                                      <button
                                        type="button"
                                        draggable={false}
                                        onPointerDown={(e) => e.stopPropagation()}
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          removeEditThumbWithSpin(index)
                                        }}
                                        className="focus-ring-none absolute right-0 top-0 z-30 flex aspect-square h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-full bg-red-500 p-0 text-white shadow-md hover:bg-red-600"
                                        aria-label={`Remove image ${index + 1}`}
                                      >
                                        {editThumbRemovingIndex === index ? (
                                          <Loader2 className="h-2.5 w-2.5 animate-spin" aria-hidden />
                                        ) : (
                                          <X className="h-2.5 w-2.5" aria-hidden />
                                        )}
                                      </button>
                                    </div>
                                  )
                                })}
                            </div>
                          </HorizontalScrollAffordance>
                        </>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Name *</label>
                        <input
                          type="text"
                          required
                          value={editingProduct.name}
                          onChange={(e) => setEditingProduct(prev => prev ? { ...prev, name: e.target.value } : null)}
                          className={selectThemeClass}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Brand *</label>
                        <input
                          type="text"
                          required
                          value={editingProduct.brand ?? ''}
                          onChange={(e) => setEditingProduct(prev => prev ? { ...prev, brand: e.target.value } : null)}
                          className={selectThemeClass}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Category *</label>
                        <select
                          required
                          value={editingProduct.category}
                          onChange={(e) => {
                            const cat = e.target.value
                            setEditingProduct((prev) => {
                              if (!prev) return null
                              const opts = subcategoriesMap[cat] ?? []
                              const nextSection = opts.includes(prev.section) ? prev.section : opts[0] ?? prev.section
                              return { ...prev, category: cat, section: nextSection }
                            })
                          }}
                          className={selectThemeClass}
                        >
                          {categories.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Subcategory *</label>
                        <select
                          required
                          value={editingProduct.section}
                          onChange={(e) => setEditingProduct(prev => prev ? { ...prev, section: e.target.value } : null)}
                          className={selectThemeClass}
                        >
                          {(subcategoriesMap[editingProduct.category] ?? []).map((s) => (
                            <option key={s} value={s}>
                              {formatSubcategoryLabel(s)}
                            </option>
                          ))}
                        </select>
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
                      <label className="block text-sm font-medium mb-1">Original price (UGX)</label>
                      <p className="mb-1.5 text-[11px] text-neutral-600 dark:text-neutral-400">
                        Optional. Higher than sale price shows the discount badge and crossed price on product cards.
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setEditingProduct((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    original_price: Math.max(0, (prev.original_price ?? 0) - 1000) || undefined,
                                  }
                                : null
                            )
                          }
                          className="focus-ring-none w-10 h-10 rounded-lg border border-neutral-300 dark:border-neutral-600 flex items-center justify-center text-lg font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min={0}
                          value={editingProduct.original_price ?? ''}
                          onChange={(e) => {
                            const v = e.target.value
                            setEditingProduct((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    original_price: v === '' ? undefined : Math.max(0, parseInt(v, 10) || 0),
                                  }
                                : null
                            )
                          }}
                          placeholder="e.g. list price"
                          className="input-overlay flex-1 px-3 py-2 rounded-lg dark:bg-neutral-700 dark:text-white text-center"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setEditingProduct((prev) =>
                              prev ? { ...prev, original_price: (prev.original_price ?? 0) + 1000 } : null
                            )
                          }
                          className="focus-ring-none w-10 h-10 rounded-lg border border-neutral-300 dark:border-neutral-600 flex items-center justify-center text-lg font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        >
                          +
                        </button>
                      </div>
                      <AdminShopCardDiscountPreview
                        saleUgx={editingProduct.price_ugx}
                        originalUgx={editingProduct.original_price ?? 0}
                      />
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
                        <label className="block text-sm font-medium mb-1">Condition *</label>
                        <select
                          value={conditions.includes(editingProduct.condition) ? editingProduct.condition : conditions[0]}
                          onChange={(e) => setEditingProduct(prev => prev ? { ...prev, condition: e.target.value } : null)}
                          className="input-overlay w-full px-3 py-2 rounded-lg dark:bg-neutral-700 dark:text-white"
                        >
                          {conditions.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Description *</label>
                      <textarea
                        required
                        rows={3}
                        value={editingProduct.description ?? ''}
                        onChange={(e) => setEditingProduct(prev => prev ? { ...prev, description: e.target.value } : null)}
                        className="input-overlay w-full px-3 py-2 rounded-lg dark:bg-neutral-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Sizes (comma-separated)</label>
                      <input
                        value={(editingProduct.sizes ?? []).join(', ')}
                        onChange={(e) =>
                          setEditingProduct((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  sizes: e.target.value
                                    .split(',')
                                    .map((s) => s.trim())
                                    .filter(Boolean),
                                }
                              : null
                          )
                        }
                        className="input-overlay w-full px-3 py-2 rounded-lg dark:bg-neutral-700 dark:text-white"
                        placeholder="S, M, L"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Colors (comma-separated)</label>
                      <input
                        value={(editingProduct.colors ?? []).join(', ')}
                        onChange={(e) =>
                          setEditingProduct((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  colors: e.target.value
                                    .split(',')
                                    .map((c) => c.trim())
                                    .filter(Boolean),
                                }
                              : null
                          )
                        }
                        className="input-overlay w-full px-3 py-2 rounded-lg dark:bg-neutral-700 dark:text-white"
                        placeholder="Red, Blue"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">SKU</label>
                      <p className="mb-1.5 text-[11px] text-neutral-600 dark:text-neutral-400">
                        Stock keeping unit (inventory id). Leave blank to clear; otherwise keep or edit.
                      </p>
                      <input
                        type="text"
                        value={editingProduct.sku ?? ''}
                        onChange={(e) => setEditingProduct(prev => prev ? { ...prev, sku: e.target.value } : null)}
                        className="input-overlay w-full px-3 py-2 rounded-lg dark:bg-neutral-700 dark:text-white"
                        placeholder="e.g. SHI-GEN-482"
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
                  </div>
                  <div className="pt-4 border-t border-neutral-200 dark:border-primary-600/40 px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 flex justify-center flex-shrink-0">
                    <Button
                      type="submit"
                      variant="default"
                      disabled={updateSubmitting}
                      className={`inline-flex min-w-[10.5rem] items-center justify-center gap-2 ${updateSubmitting ? 'opacity-80 cursor-wait' : ''}`}
                    >
                      {updateSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                          <span>Saving…</span>
                        </>
                      ) : (
                        <span>Save changes</span>
                      )}
                    </Button>
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
            className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm dark:bg-black/80 sm:p-4"
            onClick={() => {
              if (!addSubmitting) setShowAddModal(false)
            }}
          >
            <div
              className="hero-glass-frame relative w-full max-w-md sm:max-w-3xl md:max-w-5xl backdrop-blur-lg bg-white/25 dark:bg-neutral-900/20 dark:border-neutral-600 rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
              <ModalCloseButton
                onClose={() => {
                  if (!addSubmitting) setShowAddModal(false)
                }}
                className="absolute top-2 right-2 z-40 flex-shrink-0"
                aria-label="Close"
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative z-10 flex w-full max-h-[70vh] flex-col overflow-hidden rounded-bl-2xl rounded-tl-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-800 sm:max-h-[80vh] md:max-h-[85vh]"
              >
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
                        <select required value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value, section: subcategoriesMap[e.target.value]?.[0] || '' })} className={selectThemeClass}>
                          {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Subcategory *</label>
                        <select required value={newProduct.section} onChange={(e) => setNewProduct({ ...newProduct, section: e.target.value })} className={selectThemeClass}>
                          {subcategoriesMap[newProduct.category]?.map(s => <option key={s} value={s}>{formatSubcategoryLabel(s)}</option>)}
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
                        <label className="block text-sm font-medium mb-1">Original price (UGX)</label>
                        <p className="mb-1.5 text-[11px] text-neutral-600 dark:text-neutral-400">
                          Optional. Higher than sale price shows the discount badge and crossed price on product cards.
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setNewProduct((p) => ({
                                ...p,
                                original_price: String(Math.max(0, (parseInt(p.original_price, 10) || 0) - 1000)),
                              }))
                            }
                            className="focus-ring-none w-10 h-10 rounded-lg border border-neutral-300 dark:border-neutral-600 flex items-center justify-center text-lg font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min={0}
                            value={newProduct.original_price}
                            onChange={(e) => setNewProduct({ ...newProduct, original_price: e.target.value })}
                            placeholder="e.g. list price"
                            className="input-overlay flex-1 px-3 py-2 rounded-lg dark:bg-neutral-700 dark:text-white text-center"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setNewProduct((p) => ({
                                ...p,
                                original_price: String((parseInt(p.original_price, 10) || 0) + 1000),
                              }))
                            }
                            className="focus-ring-none w-10 h-10 rounded-lg border border-neutral-300 dark:border-neutral-600 flex items-center justify-center text-lg font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700"
                          >
                            +
                          </button>
                        </div>
                        <AdminShopCardDiscountPreview
                          saleUgx={parseInt(newProduct.price_ugx, 10) || 0}
                          originalUgx={parseInt(newProduct.original_price, 10) || 0}
                        />
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
                        <select value={newProduct.condition} onChange={(e) => setNewProduct({ ...newProduct, condition: e.target.value })} className={selectThemeClass}>
                          {conditions.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Images *</label>
                      <input id="add-imgs" type="file" accept="image/*" multiple onChange={(e) => handleImageUpload(e, setProductImages)} className="hidden" />
                      <Button type="button" variant="default" size="sm" onClick={() => document.getElementById('add-imgs')?.click()} className="inline-flex items-center gap-2">
                        Browse
                      </Button>
                      {productImages.length > 0 && (
                        <>
                          <div className="mt-3 relative mr-auto w-full max-w-[14rem] aspect-square overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-700">
                            <SafeImage
                              src={productImages[0]}
                              alt="Main image preview"
                              fill
                              className="object-contain object-center"
                              sizes="224px"
                              loading="lazy"
                            />
                            </div>
                          <HorizontalScrollAffordance
                            showEdgeFades={false}
                            syncScrollEdgeLines
                            syncScrollEdgeLineClassName={SLIDER_SYNC_EDGE_LINE_CLASS}
                            hideScrollbar
                            className="pt-2"
                            scrollClassName="py-3"
                            scrollAriaLabel="New product images"
                          >
                            <div className="flex min-h-[1px] min-w-full w-max flex-row items-center justify-start gap-2 px-1 md:gap-3">
                              {productImages.map((img, index) => {
                                const isMain = index === 0
                                return (
                                  <div
                                    key={`${index}-${img.length}`}
                                    role="button"
                                    tabIndex={0}
                                    draggable
                                    data-new-thumb-index={index}
                                    onPointerDown={(e) => {
                                      if (e.pointerType !== 'touch') return
                                      touchDraggingNewImageIndexRef.current = index
                                      try {
                                        e.currentTarget.setPointerCapture(e.pointerId)
                                      } catch {
                                        /* pointer capture unsupported */
                                      }
                                    }}
                                    onPointerMove={(e) => {
                                      if (e.pointerType !== 'touch') return
                                      if (touchDraggingNewImageIndexRef.current === null) return
                                      const under = document.elementFromPoint(e.clientX, e.clientY)
                                      if (!under) return
                                      const thumb = under.closest('[data-new-thumb-index]') as HTMLElement | null
                                      if (!thumb) return
                                      const raw = thumb.getAttribute('data-new-thumb-index')
                                      if (raw == null) return
                                      const targetIndex = Number.parseInt(raw, 10)
                                      if (!Number.isFinite(targetIndex)) return
                                      const from = touchDraggingNewImageIndexRef.current
                                      if (from === targetIndex) return
                                      reorderProductImages(from, targetIndex)
                                      touchDraggingNewImageIndexRef.current = targetIndex
                                    }}
                                    onPointerUp={(e) => {
                                      if (e.pointerType !== 'touch') return
                                      touchDraggingNewImageIndexRef.current = null
                                      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                                        e.currentTarget.releasePointerCapture(e.pointerId)
                                      }
                                    }}
                                    onPointerCancel={(e) => {
                                      if (e.pointerType !== 'touch') return
                                      touchDraggingNewImageIndexRef.current = null
                                      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                                        e.currentTarget.releasePointerCapture(e.pointerId)
                                      }
                                    }}
                                    onDragStart={() => {
                                      draggingNewImageIndexRef.current = index
                                    }}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                      e.preventDefault()
                                      const sourceIndex = draggingNewImageIndexRef.current
                                      if (sourceIndex === null) return
                                      reorderProductImages(sourceIndex, index)
                                      draggingNewImageIndexRef.current = null
                                    }}
                                    onDragEnd={() => {
                                      draggingNewImageIndexRef.current = null
                                    }}
                                    aria-current={isMain ? 'true' : undefined}
                                    className={`focus-ring-none relative aspect-square w-[calc((100vw-5rem)/4)] max-w-[5.25rem] flex-shrink-0 cursor-grab overflow-hidden rounded-xl border bg-neutral-100 transition-all duration-200 active:cursor-grabbing sm:max-w-none sm:w-12 md:w-14 dark:bg-neutral-800/40 touch-none ${
                                      isMain
                                        ? 'z-[1] border-2 border-primary-600 shadow-md dark:border-primary-400'
                                        : 'border-neutral-300/90 hover:border-primary-400/70 dark:border-neutral-600 dark:hover:border-primary-500/60'
                                    }`}
                                  >
                                    <span className="absolute inset-0 overflow-hidden rounded-[inherit] bg-neutral-50 dark:bg-neutral-900/50">
                                      <SafeImage
                                        src={img}
                                        alt={`New product image ${index + 1}`}
                                        fill
                                        className="object-contain object-center"
                                        sizes="64px"
                                        loading="lazy"
                                      />
                                    </span>
                                    <button
                                      type="button"
                                      draggable={false}
                                      onPointerDown={(e) => e.stopPropagation()}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        removeProductImageWithSpin(index)
                                      }}
                                      className="focus-ring-none absolute right-0 top-0 z-30 flex aspect-square h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-full bg-red-500 p-0 text-white shadow-md hover:bg-red-600"
                                      aria-label={`Remove image ${index + 1}`}
                                    >
                                      {addRemovingIndex === index ? (
                                        <Loader2 className="h-2.5 w-2.5 animate-spin" aria-hidden />
                                      ) : (
                                        <X className="h-2.5 w-2.5" aria-hidden />
                                      )}
                                    </button>
                        </div>
                                )
                              })}
                            </div>
                          </HorizontalScrollAffordance>
                        </>
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
                  <div className="pt-4 border-t border-neutral-200 dark:border-primary-600/40 px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 flex justify-center flex-shrink-0">
                    <Button
                      type="submit"
                      variant="default"
                      disabled={addSubmitting}
                      className={`inline-flex min-w-[10.5rem] items-center justify-center gap-2 ${addSubmitting ? 'opacity-80 cursor-wait' : ''}`}
                    >
                      {addSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                          <span>Adding…</span>
                        </>
                      ) : (
                        <span>Add product</span>
                      )}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1150] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm dark:bg-black/85"
            onClick={() => {
              if (!deleteBusy) setDeleteTarget(null)
            }}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="hero-glass-frame relative w-full max-w-md overflow-hidden rounded-2xl backdrop-blur-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="hero-glass-frame-overlay pointer-events-none absolute inset-0 rounded-[inherit]" aria-hidden />
              <ModalCloseButton
                onClose={() => {
                  if (!deleteBusy) setDeleteTarget(null)
                }}
                className="absolute top-2 right-2 z-40 flex-shrink-0"
                aria-label="Close"
              />
              <div className="relative z-10 flex max-h-[min(90vh,34rem)] flex-col overflow-hidden rounded-bl-2xl rounded-tl-2xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800">
                <div className="modal-scroll min-h-0 flex-1 overflow-y-auto p-6 pt-12 sm:p-8 sm:pt-14">
                <h2 className="text-xl font-bold text-primary-800 dark:text-primary-100">Remove product?</h2>
                <p className="mt-2 text-neutral-700 dark:text-primary-300">
                  <span className="font-semibold text-neutral-900 dark:text-primary-50">
                    &ldquo;{deleteTarget.name}&rdquo;
                  </span>
                </p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-neutral-600 dark:text-primary-400">
                  Reason for removal
                </p>
                <div className="mt-3">
                  <select
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value as RemovalReasonKey)}
                    className={selectThemeClass}
                    disabled={deleteBusy}
                  >
                    {DELETE_REASON_OPTIONS.map((opt) => (
                      <option key={opt.key} value={opt.key}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs text-neutral-600 dark:text-primary-400">
                    {DELETE_REASON_OPTIONS.find((opt) => opt.key === deleteReason)?.description}
                  </p>
                </div>
                <div className="mt-6 flex justify-center">
                  <Button
                    type="button"
                    variant="default"
                    size="icon"
                    disabled={deleteBusy}
                    onClick={() => performDelete(deleteTarget, deleteReason)}
                    className={`focus-ring-none h-10 w-10 ${ICON_BTN_RED}`}
                    aria-label="Delete product"
                  >
                    {deleteBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                  </Button>
                </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {undoDeletedProduct && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-5 right-5 z-[1200] w-[min(90vw,18rem)]"
          >
            <div className="hero-glass-frame relative overflow-hidden rounded-xl backdrop-blur-lg">
              <div className="hero-glass-frame-overlay pointer-events-none absolute inset-0 rounded-[inherit]" aria-hidden />
              <div className="relative z-10 rounded-bl-xl rounded-tl-xl border border-neutral-200 bg-white px-3 py-2.5 dark:border-neutral-700 dark:bg-neutral-800">
                <ModalCloseButton
                  onClose={() => setUndoDeletedProduct(null)}
                  className="absolute -right-4 -top-4 z-40 flex-shrink-0"
                  aria-label="Dismiss undo"
                />
                <p className="pr-8 text-sm text-neutral-800 dark:text-primary-200">Product deleted.</p>
                <div className="mt-2">
                  <Button type="button" variant="default" size="sm" disabled={undoBusy} onClick={() => void undoDeleteProduct()}>
                    {undoBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Undo Delete
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {addImageRequiredOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1160] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm dark:bg-black/85"
            onClick={() => setAddImageRequiredOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="hero-glass-frame relative w-full max-w-xs overflow-hidden rounded-2xl backdrop-blur-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="hero-glass-frame-overlay pointer-events-none absolute inset-0 rounded-[inherit]" aria-hidden />
              <div className="relative z-10 overflow-hidden rounded-bl-2xl rounded-tl-2xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800">
                <ModalCloseButton
                  onClose={() => setAddImageRequiredOpen(false)}
                  className="absolute -right-4 -top-4 z-40 flex-shrink-0"
                  aria-label="Close"
                />
                <div className="px-5 pb-5 pt-8 text-center">
                  <p className="text-sm font-semibold text-red-600 dark:text-red-400">Add at least one image.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <FeedbackDialog
        open={feedback.open}
        message={feedback.message}
        variant={feedback.variant}
        onClose={() => setFeedback((prev) => ({ ...prev, open: false }))}
        zClassName="z-[1160]"
      />
    </div>
  )
}
