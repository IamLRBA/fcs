'use client'

import { useState, useEffect, useRef, type SVGProps } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HiMenu, HiX, HiSearch } from 'react-icons/hi'
import { HiOutlineUserCircle, HiUserCircle, HiOutlineShoppingBag, HiMiniShoppingBag } from 'react-icons/hi2'
import { ShoppingCart } from 'lucide-react'
import SettingsDropdown from '@/components/ui/SettingsDropdown'
import MysticalPiecesWord from '@/components/ui/MysticalPiecesWord'
import LogoMark from '@/components/ui/LogoMark'
import useScrollLock from '@/components/layout/useScrollLock'
import { CartManager } from '@/lib/cart'

type IconProps = SVGProps<SVGSVGElement>

const HomeOutlineIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 9.5 12 3l9 6.5v11a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1v-5h-4v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-11Z" />
  </svg>
)

const HomeSolidIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 3 3 9.5V20a1 1 0 0 0 1 1h5.5a.5.5 0 0 0 .5-.5V15h4v5.5a.5.5 0 0 0 .5.5H20a1 1 0 0 0 1-1V9.5L12 3Z" />
  </svg>
)

const TargetOutlineIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.5" />
  </svg>
)

const TargetSolidIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm0 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0 2.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
  </svg>
)

const navigation = [
  { name: 'Home', href: '/', outlineIcon: HomeOutlineIcon, solidIcon: HomeSolidIcon },
  { name: 'About Us', href: '/about-us', outlineIcon: HiOutlineUserCircle, solidIcon: HiUserCircle },
]

const portalItems = [
  { name: 'Shop', href: '/sections/shop', outlineIcon: HiOutlineShoppingBag, solidIcon: HiMiniShoppingBag },
]

interface Product {
  id: string
  name: string
  brand: string
  category: string
  section: string
  description: string
  sku: string
}

interface SearchResult {
  product: Product
  category: string
  section: string
  href: string
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [menuSurfaceLocked, setMenuSurfaceLocked] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isPortalsOpen, setIsPortalsOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [navSurfaceClass, setNavSurfaceClass] = useState('bg-transparent')
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredSuggestions, setFilteredSuggestions] = useState<SearchResult[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const pathname = usePathname()
  const searchRef = useRef<HTMLDivElement>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useScrollLock(isOpen)
  
  // Load all products from DB for navbar search
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch('/api/products?lite=1')
        if (!res.ok) return
        const data: Product[] = await res.json()
        setAllProducts(data)
      } catch (error) {
        console.error('Error loading searchable products:', error)
      }
    }
    loadProducts()
  }, [])

  useEffect(() => {
    const updateCartCount = () => {
      setCartCount(CartManager.getCartCount())
    }
    updateCartCount()
    window.addEventListener('storage', updateCartCount)
    window.addEventListener('cartUpdated', updateCartCount)
    return () => {
      window.removeEventListener('storage', updateCartCount)
      window.removeEventListener('cartUpdated', updateCartCount)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (isOpen || menuSurfaceLocked || isSettingsOpen) return
    setNavSurfaceClass(isScrolled ? 'bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md shadow-lg' : 'bg-transparent')
  }, [isScrolled, isOpen, menuSurfaceLocked, isSettingsOpen])

  const handleMenuToggle = () => {
    if (!isOpen) {
      setNavSurfaceClass(isScrolled ? 'bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md shadow-lg' : 'bg-transparent')
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
      setMenuSurfaceLocked(true)
      setIsOpen(true)
      return
    }
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false)
      setMenuSurfaceLocked(false)
    }, 220)
  }

  // Search through products
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSuggestions([])
      setIsSearching(false)
      setShowSuggestions(false)
    } else {
      const query = searchQuery.toLowerCase().trim()
      const results: SearchResult[] = []
      
      // Search through all products
      allProducts.forEach(product => {
        const searchableText = [
          product.name,
          product.brand,
          product.category,
          product.section,
          product.description,
          product.sku
        ].join(' ').toLowerCase()
        
        if (searchableText.includes(query)) {
          // Format category name for display
          const categoryName = product.category
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
          
          // Format section name for display
          const sectionName = product.section
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
          
          results.push({
            product,
            category: categoryName,
            section: sectionName,
            href: `/products/${product.category}#${product.section}`
          })
        }
      })
      
      // Limit results to 10 for better UX
      setFilteredSuggestions(results.slice(0, 10))
      setIsSearching(true)
      setShowSuggestions(true)
    }
  }, [searchQuery, allProducts])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    // The useEffect hook will handle filtering automatically
  }

  const clearSearch = () => {
    setSearchQuery('')
    setIsSearchOpen(false)
    setIsSearching(false)
    setShowSuggestions(false)
  }

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen)
    if (!isSearchOpen) setShowSuggestions(false)
  }

  const handleSuggestionClick = (href: string) => {
    setSearchQuery('')
    setIsSearchOpen(false)
    window.location.href = href
  }

  const closeMenu = () => {
    setMenuSurfaceLocked(false)
    setIsOpen(false)
    setIsSearchOpen(false)
    setIsPortalsOpen(false)
  }

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href))

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`navbar-shell fixed top-0 left-4 right-0 lg:left-4 lg:right-4 z-[1010] transition-all duration-300 ${
          (isOpen || menuSurfaceLocked || isSettingsOpen) ? navSurfaceClass : (isScrolled
            ? 'bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md shadow-lg'
            : 'bg-transparent')
        }`}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 relative">
            {/* Left side - Logo */}
            <div className="flex items-center">
              <Link href="/" className="focus-ring-none flex items-center gap-1.5 group">
                <LogoMark size={48} className="shrink-0 transition-transform duration-300 group-hover:scale-110" />
                <MysticalPiecesWord className="text-2xl text-primary-800 dark:text-primary-100 group-hover:text-primary-900 dark:group-hover:text-primary-200 transition-colors duration-300" />
              </Link>
            </div>

            {/* Center - Navigation Links (Home, Portal, About Us) */}
            <div className="hidden lg:flex items-center space-x-4 absolute left-1/2 -translate-x-1/2">
              {navigation.filter(item => item.name === 'Home').map((item) => {
                const active = isActive(item.href)
                const Icon = active ? item.solidIcon : item.outlineIcon
                return (
                  <Link key={item.name} href={item.href} className={`nav-icon-no-focus flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 group relative ${active ? 'text-primary-700 dark:text-primary-300' : 'text-neutral-600 dark:text-neutral-400 hover:text-primary-700 dark:hover:text-primary-300'}`}>
                    <Icon className="w-4 h-4 transition-colors" />
                    <span className="font-light">{item.name}</span>
                    {active ? (
                      <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" initial={false} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
                    ) : (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                    )}
                  </Link>
                )
              })}
              <div className="relative">
                <button type="button" onClick={() => setIsPortalsOpen(!isPortalsOpen)} onMouseEnter={() => setIsPortalsOpen(true)} onMouseLeave={() => setIsPortalsOpen(false)} className={`nav-icon-no-focus flex items-center space-x-2 px-3 py-2 transition-all duration-300 group relative ${portalItems.some(item => isActive(item.href)) ? 'text-primary-700 dark:text-primary-300' : 'text-neutral-600 dark:text-neutral-400 hover:text-primary-700 dark:hover:text-primary-300'}`}>
                  {(() => {
                    const portalActive = portalItems.some(item => isActive(item.href))
                    const PortalIcon = portalActive ? TargetSolidIcon : TargetOutlineIcon
                    return <PortalIcon className="w-4 h-4 transition-colors" />
                  })()}
                  <span className="font-light">Portal</span>
                  <span className="btn-unified-circle btn-unified-circle-sm inline-flex items-center justify-center flex-shrink-0">⇓</span>
                  {portalItems.some(item => isActive(item.href)) ? (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" initial={false} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
                  ) : (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  )}
                </button>
                <AnimatePresence>
                  {isPortalsOpen && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} onMouseEnter={() => setIsPortalsOpen(true)} onMouseLeave={() => setIsPortalsOpen(false)} className="absolute top-full left-0 mt-2 w-64 hero-glass-frame backdrop-blur-lg rounded-lg shadow-xl z-50 overflow-hidden p-2.5">
                      <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
                      <div className="relative z-10 rounded-md overflow-hidden bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 py-2">
                        {portalItems.map((item) => {
                          const active = isActive(item.href)
                          const Icon = active ? item.solidIcon : item.outlineIcon
                          const hoverBg =
                            item.name === 'Shop' ? '' : 'hover:bg-primary-50 dark:hover:bg-neutral-700/50'
                          return (
                            <Link key={item.name} href={item.href} className={`focus-ring-none flex items-center space-x-3 px-4 py-3 transition-all duration-200 ${hoverBg} ${active ? 'text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-neutral-700/30' : 'text-neutral-600 dark:text-neutral-300 hover:text-primary-700 dark:hover:text-primary-200'}`}>
                              <Icon className="w-4 h-4 transition-colors" />
                              <span className="font-light">{item.name}</span>
                            </Link>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {navigation.filter(item => item.name === 'About Us').map((item) => {
                const active = isActive(item.href)
                const Icon = active ? item.solidIcon : item.outlineIcon
                return (
                  <Link key={item.name} href={item.href} className={`nav-icon-no-focus flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 group relative ${active ? 'text-primary-700 dark:text-primary-300' : 'text-neutral-600 dark:text-neutral-400 hover:text-primary-700 dark:hover:text-primary-300'}`}>
                    <Icon className="w-4 h-4 transition-colors" />
                    <span className="font-light">{item.name}</span>
                    {active ? (
                      <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" initial={false} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
                    ) : (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Right side - Search, Cart, Settings */}
            <div className="hidden lg:flex items-center space-x-8">
              <div className={`relative ml-10 flex items-center ${isSearchOpen ? 'gap-2' : ''}`} ref={searchRef}>
                <button onClick={isSearchOpen ? handleSearchSubmit : toggleSearch} className="focus-ring-none shrink-0 p-2 text-neutral-600 dark:text-neutral-400 hover:text-primary-700 dark:hover:text-primary-300 transition-all duration-200 flex items-center justify-center" type={isSearchOpen ? 'submit' : 'button'}>
                  <HiSearch className="w-5 h-5" />
                </button>
                {isSearchOpen && (
                  <form onSubmit={handleSearchSubmit} className="navbar-search-form inline-flex items-center shrink-0">
                    <div className="search-input-wrapper w-40">
                      {isSearchOpen && (
                        <button type="button" onClick={clearSearch} className="focus-ring-none absolute right-3 top-1/2 transform -translate-y-1/2 z-10 p-1 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors duration-200">
                          <HiX className="w-4 h-4" />
                        </button>
                      )}
                      <input
                        type="text"
                        placeholder="Search items..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className={`navbar-search-input input-overlay pl-4 ${isSearchOpen ? 'pr-10' : ''}`}
                        autoFocus
                      />
                      {showSuggestions && (
                        <div className="absolute top-full left-0 mt-2 w-full min-w-[16rem] hero-glass-frame hero-glass-more-transparent backdrop-blur-lg rounded-lg overflow-hidden p-4 z-50">
                          <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
                          <div className="relative z-10 rounded-md bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 max-h-80 overflow-y-auto modal-scrollbar">
                            {filteredSuggestions.length > 0 ? (
                              filteredSuggestions.map((item) => (
                                <div key={`${item.product.id}-${item.product.name}`} className="suggestion-item" onClick={() => handleSuggestionClick(item.href)}>
                                  <span className="suggestion-category">{item.category} • {item.section}</span>
                                  <span className="suggestion-title">{item.product.name} - {item.product.brand}</span>
                                </div>
                              ))
                            ) : (
                              <div className="suggestion-item no-results">No Results for "{searchQuery}"</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </form>
                )}
              </div>
              <Link href="/cart" className="focus-ring-none relative p-2 text-neutral-600 dark:text-neutral-400 hover:text-primary-700 dark:hover:text-primary-300 transition-all duration-200">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 bg-primary-600 dark:bg-primary-500 text-white text-xs font-light rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </motion.span>
                )}
              </Link>
              <SettingsDropdown onOpenChange={setIsSettingsOpen} />
            </div>

            <button onClick={handleMenuToggle} className="focus-ring-none lg:hidden absolute right-0 p-2 text-neutral-600 dark:text-neutral-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-200 relative w-10 h-10 flex items-center justify-center" aria-label="Menu">
              <div className="relative w-6 h-5 flex flex-col justify-between">
                <motion.span
                  animate={isOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="absolute top-0 left-0 w-full h-0.5 bg-current rounded-full origin-center"
                />
                <motion.span
                  animate={isOpen ? { opacity: 0, x: -20 } : { opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="absolute top-1/2 left-0 w-full h-0.5 bg-current rounded-full origin-center -translate-y-1/2"
                />
                <motion.span
                  animate={isOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-current rounded-full origin-center"
                />
              </div>
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] lg:hidden" 
              onClick={closeMenu} 
            />
            <motion.div 
              initial={{ x: '100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '100%' }} 
              transition={{ type: 'spring', stiffness: 300, damping: 30 }} 
              className="fixed top-20 right-0 w-[85vw] max-w-sm max-h-[calc(100vh-10rem)] hero-glass-frame hero-glass-more-transparent backdrop-blur-lg z-[1005] lg:hidden rounded-l-2xl rounded-r-none overflow-hidden flex flex-col p-4"
            >
              <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-l-2xl rounded-r-none" aria-hidden />
              <div className="relative z-10 rounded-l-xl rounded-r-none overflow-y-auto max-h-[calc(100vh-12rem)] menu-inner-light-depth shadow-2xl border border-gray-200 dark:border-neutral-700 overscroll-contain">
              <div className="px-6 pt-6 pb-6 space-y-4">
                {/* Navigation Links */}
                <div className="space-y-1">
                  {navigation.map((item) => {
                    const active = isActive(item.href)
                    const Icon = active ? item.solidIcon : item.outlineIcon
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={closeMenu}
                        className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden ${
                          active
                            ? 'bg-gradient-to-r from-primary-100 to-primary-50 dark:from-primary-900/50 dark:to-primary-800/30 text-primary-700 dark:text-primary-300 shadow-sm'
                            : 'text-neutral-700 dark:text-neutral-300 hover:bg-gradient-to-r hover:from-neutral-100 hover:to-neutral-50 dark:hover:from-neutral-700 dark:hover:to-neutral-700/50'
                        }`}
                      >
                        <div className={`p-2 rounded-lg transition-all duration-200 bg-transparent ${active ? 'text-primary-700 dark:text-primary-300' : 'text-neutral-600 dark:text-neutral-400 group-hover:text-primary-600 dark:group-hover:text-primary-300'}`}>
                          <Icon className="w-4 h-4 transition-colors" />
                        </div>
                        <span className={`font-light flex-1 ${active ? 'text-primary-800 dark:text-primary-200' : ''}`}>{item.name}</span>
                        {active && (
                          <motion.div 
                            layoutId="mobileActiveIndicator"
                            className="absolute right-4 w-2 h-2 bg-primary-600 rounded-full"
                            initial={false}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        )}
                      </Link>
                    )
                  })}
                </div>

                <div className="divider-faded my-4" />

                {/* Portal Section */}
                <div className="space-y-1">
                  {/*
                    Determine if any portal item is active to style icon accordingly.
                  */}
                  {(() => {
                    const portalActive = portalItems.some(item => isActive(item.href))
                    const PortalIcon = portalActive ? TargetSolidIcon : TargetOutlineIcon
                    return (
                      <button
                        type="button"
                        onClick={() => setIsPortalsOpen(!isPortalsOpen)}
                        className="nav-icon-no-focus group flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-200 text-neutral-700 dark:text-neutral-300 hover:bg-gradient-to-r hover:from-neutral-100 hover:to-neutral-50 dark:hover:from-neutral-700 dark:hover:to-neutral-700/50"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-transparent transition-colors duration-200">
                            <PortalIcon className="w-4 h-4 text-neutral-600 dark:text-neutral-400 group-hover:text-primary-600 dark:group-hover:text-primary-300" />
                          </div>
                          <span className="font-light">Portal</span>
                        </div>
                        <motion.span 
                          animate={{ rotate: isPortalsOpen ? 180 : 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="btn-unified-circle btn-unified-circle-sm inline-flex items-center justify-center flex-shrink-0 text-primary-600 dark:text-primary-400"
                        >
                          ⇓
                        </motion.span>
                      </button>
                    )
                  })()}
                  <AnimatePresence>
                    {isPortalsOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden hero-glass-frame hero-glass-frame-compact backdrop-blur-lg rounded-lg mt-1 p-2.5"
                      >
                        <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
                        <div className="relative z-10 rounded-md bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 pl-4 pr-2 py-2 space-y-1">
                          {portalItems.map((item) => {
                            const active = isActive(item.href)
                            const Icon = active ? item.solidIcon : item.outlineIcon
                            return (
                              <Link
                                key={item.name}
                                href={item.href}
                                onClick={closeMenu}
                                className={`focus-ring-none group flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                                  active
                                    ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
                                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700/50'
                                }`}
                              >
                                <Icon className={`w-4 h-4 transition-colors ${active ? 'text-primary-600 dark:text-primary-400' : ''}`} />
                                <span className={`font-light text-sm ${active ? 'text-primary-800 dark:text-primary-200' : ''}`}>{item.name}</span>
                              </Link>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="divider-faded my-4" />

                {/* Mobile Search – centered, icon left, X inside input */}
                <div className="relative flex justify-center px-4" ref={searchRef}>
                  <form
                    onSubmit={handleSearchSubmit}
                    className="navbar-search-form flex items-center w-full max-w-md mx-auto"
                  >
                    <button
                      type="submit"
                      className="nav-icon-no-focus shrink-0 p-2.5 mr-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                      aria-label="Search"
                    >
                      <HiSearch className="w-5 h-5" />
                    </button>
                    <div className="search-input-wrapper relative flex-1">
                      <input
                        type="text"
                        placeholder="Search Items..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="navbar-search-input input-overlay w-full py-2.5 pl-4 pr-10 text-sm border-0 bg-white/80 dark:bg-neutral-800/80 rounded-xl"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={clearSearch}
                          className="focus-ring-none absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                          aria-label="Clear search"
                        >
                          <HiX className="w-4 h-4" />
                        </button>
                      )}
                      {showSuggestions && (
                        <div className="absolute top-full left-0 right-0 mt-2 w-full hero-glass-frame hero-glass-more-transparent backdrop-blur-lg rounded-lg overflow-hidden p-4 z-50">
                          <div
                            className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]"
                            aria-hidden
                          />
                          <div className="relative z-10 rounded-md bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 max-h-80 overflow-y-auto modal-scrollbar">
                            {filteredSuggestions.length > 0 ? (
                              filteredSuggestions.map((item) => (
                                <div
                                  key={`${item.product.id}-${item.product.name}`}
                                  className="suggestion-item"
                                  onClick={() => handleSuggestionClick(item.href)}
                                >
                                  <span className="suggestion-category">
                                    {item.category} • {item.section}
                                  </span>
                                  <span className="suggestion-title">
                                    {item.product.name} - {item.product.brand}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <div className="suggestion-item no-results">
                                No Results for "{searchQuery}"
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </form>
                </div>

                <div className="divider-faded my-4" />

                {/* Mobile Cart */}
                <div className="space-y-1">
                  <Link
                    href="/cart"
                    onClick={closeMenu}
                    className="group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-neutral-700 dark:text-neutral-300 hover:bg-gradient-to-r hover:from-neutral-100 hover:to-neutral-50 dark:hover:from-neutral-700 dark:hover:to-neutral-700/50 relative overflow-hidden"
                  >
                    <div className="p-2 rounded-lg bg-transparent transition-colors duration-200">
                      <ShoppingCart className="w-4 h-4 text-neutral-600 dark:text-neutral-400 group-hover:text-primary-600 dark:group-hover:text-primary-300" />
                    </div>
                    <span className="font-light flex-1">Cart</span>
                    {cartCount > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-gradient-to-br from-primary-600 to-primary-700 text-white text-xs font-light rounded-full w-7 h-7 flex items-center justify-center"
                      >
                        {cartCount > 99 ? '99+' : cartCount}
                      </motion.span>
                    )}
                  </Link>
                </div>

                <div className="divider-faded my-4" />

                {/* Mobile Settings - icon only, aligned with other items */}
                <div className="space-y-1">
                  <div className="flex items-center justify-start px-4 py-3 rounded-xl text-neutral-700 dark:text-neutral-300">
                    <SettingsDropdown variant="mobile" onOpenChange={setIsSettingsOpen} />
                  </div>
                </div>
              </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}


