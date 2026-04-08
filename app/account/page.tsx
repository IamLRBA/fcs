'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Package, Eye, Star, User, Mail, Phone, Camera, X } from 'lucide-react'
import { AuthManager } from '@/lib/auth'
import { OrderManager, type Order } from '@/lib/cart'
import type { User as UserType, Review } from '@/lib/auth'
import { AnimatePresence } from 'framer-motion'
import Button from '@/components/ui/Button'
import ModalCloseButton from '@/components/ui/ModalCloseButton'
import { SkeletonAccountPage } from '@/components/ui/Skeleton'
import SegmentedPillNav from '@/components/ui/SegmentedPillNav'
import OrderItemsDetail from '@/components/orders/OrderItemsDetail'
import { formatOrderReceiptDisplayName } from '@/lib/utils/order-display'

export default function AccountPage() {
  const [user, setUser] = useState<UserType | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'reviews'>('overview')
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [profileImage, setProfileImage] = useState<string>('')
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [showBackButton, setShowBackButton] = useState(true)
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
  const router = useRouter()
  const profileFileInputRef = useRef<HTMLInputElement>(null)

  const accountTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'orders', label: 'Orders' },
    { id: 'reviews', label: 'Reviews' },
  ]

  useEffect(() => {
    const currentUser = AuthManager.getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    
    setUser(currentUser)
    setOrders(OrderManager.getOrders().filter(o => o.customer.email === currentUser.email))
    setProfileImage(currentUser.profileImage || '')
    
    const handleAuthChange = () => {
      const updatedUser = AuthManager.getCurrentUser()
      if (!updatedUser) {
        router.push('/login')
      } else {
        setUser(updatedUser)
        setProfileImage(updatedUser.profileImage || '')
      }
    }

    window.addEventListener('authStateChanged', handleAuthChange)
    return () => window.removeEventListener('authStateChanged', handleAuthChange)
  }, [router])

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

  if (!user) {
    return <SkeletonAccountPage />
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB')
        return
      }
      
      setProfileImageFile(file)
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setProfileImage('')
    setProfileImageFile(null)
  }

  const handleSaveProfile = async () => {
    if (!user) return
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileImageUrl: profileImage || null }),
      })
      if (!res.ok) {
        alert('Failed to update profile picture')
        return
      }
      const updated = await res.json()
      const mergedUser = { ...user, profileImage: updated.profileImage }
      setUser(mergedUser)
      AuthManager.setSessionUser(mergedUser)
      setShowEditProfile(false)
      setProfileImageFile(null)
      alert('Profile picture updated successfully!')
    } catch {
      alert('Failed to update profile picture')
    }
  }

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewText.trim() || !user) return

    const result = AuthManager.addReview(reviewText, reviewRating)
    if (result.success) {
      setReviewText('')
      setReviewRating(5)
      const updatedUser = AuthManager.getCurrentUser()
      if (updatedUser) setUser(updatedUser)
      alert('Thank you for your review! It will appear on the homepage testimonials.')
    } else {
      alert(result.error || 'Could not submit your review. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-unified pt-24 pb-20">
      {/* Fixed Back Button */}
      <motion.div
        animate={{ opacity: showBackButton ? 1 : 0, x: showBackButton ? 0 : -120, y: showBackButton ? 0 : -20 }}
        transition={{ duration: 0.3 }}
        className="fixed top-20 left-4 sm:left-8 z-50 pointer-events-none"
        style={{ pointerEvents: showBackButton ? 'auto' : 'none' }}
      >
        <Link href="/" className="focus-ring-none inline-flex items-center gap-2 text-primary-600 dark:text-primary-300 hover:text-primary-800 dark:hover:text-primary-100 transition-colors duration-300">
          <span className="btn-unified-circle flex-shrink-0">⟸</span>
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
      </motion.div>
      <div className="container-custom mt-12 pt-20 sm:pt-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">

        <div className="hero-glass-frame relative backdrop-blur-lg w-full">
          <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none" aria-hidden />
        <div className="relative z-10 bg-neutral-100/80 dark:bg-neutral-800 rounded-2xl shadow-xl overflow-hidden border border-neutral-200 dark:border-neutral-700">
          {/* Header - slightly darker shade in light mode */}
          <div className="bg-neutral-200/70 dark:bg-neutral-700 border-b border-neutral-200 dark:border-neutral-600 p-4 sm:p-6 md:p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-4 border-neutral-300/80 dark:border-neutral-700 flex items-center justify-center text-2xl sm:text-3xl font-bold bg-neutral-300/60 dark:bg-neutral-700">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-primary-600 dark:text-primary-400">{user.fullName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <Button
                  variant="filled"
                  size="icon"
                  onClick={() => { setShowEditProfile(true); setProfileImage(user.profileImage || '') }}
                  className="absolute bottom-0 right-0 w-8 h-8 min-w-0 rounded-full border-2 border-white dark:border-neutral-800 shadow-md"
                  title="Edit profile picture"
                >
                  <Camera className="w-4 h-4 text-white" />
                </Button>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-neutral-900 dark:text-neutral-100 break-words">{user.fullName}</h1>
                <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 truncate sm:whitespace-normal">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="border-b border-neutral-200 dark:border-neutral-700 px-3 py-4 sm:px-4 sm:py-5">
            <div className="max-w-xl mx-auto">
              <SegmentedPillNav
                items={accountTabs}
                value={activeTab}
                onSelect={(id) => {
                  setActiveTab(id as 'overview' | 'orders' | 'reviews')
                  setExpandedOrderId(null)
                }}
                className="!max-w-none"
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 md:p-8">
            {activeTab === 'overview' && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-3 sm:mb-4 text-center">Account Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="group flex items-center gap-3 p-4 rounded-xl border border-neutral-300/80 dark:border-neutral-600 bg-white/80 dark:bg-neutral-900/40">
                      <Mail className="w-5 h-5 shrink-0 text-primary-600 dark:text-primary-400 transition-colors group-hover:text-primary-700 dark:group-hover:text-primary-300" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">Email</p>
                        <p className="font-medium text-sm sm:text-base text-neutral-900 dark:text-neutral-200 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="group flex items-center gap-3 p-4 rounded-xl border border-neutral-300/80 dark:border-neutral-600 bg-white/80 dark:bg-neutral-900/40">
                      <Phone className="w-5 h-5 shrink-0 text-primary-600 dark:text-primary-400 transition-colors group-hover:text-primary-700 dark:group-hover:text-primary-300" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">Phone</p>
                        <p className="font-medium text-sm sm:text-base text-neutral-900 dark:text-neutral-200">{user.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-3 sm:mb-4 text-center">Quick Stats</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 justify-items-stretch">
                    <div className="group p-4 sm:p-5 rounded-xl border border-neutral-300/80 dark:border-neutral-600 bg-white/80 dark:bg-neutral-900/40 text-center sm:text-left">
                      <Package className="w-6 h-6 sm:w-7 sm:h-7 mb-2 sm:mb-3 mx-auto sm:mx-0 text-primary-600 dark:text-primary-400 transition-colors group-hover:text-primary-700 dark:group-hover:text-primary-300" />
                      <p className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">{orders.length}</p>
                      <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">Total Orders</p>
                    </div>
                    <div className="group p-4 sm:p-5 rounded-xl border border-neutral-300/80 dark:border-neutral-600 bg-white/80 dark:bg-neutral-900/40 text-center sm:text-left">
                      <Star className="w-6 h-6 sm:w-7 sm:h-7 mb-2 sm:mb-3 mx-auto sm:mx-0 text-accent-600 dark:text-accent-400 transition-colors group-hover:text-accent-700 dark:group-hover:text-accent-300" />
                      <p className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">{user.reviews?.length || 0}</p>
                      <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">Reviews Written</p>
                    </div>
                    <div className="group p-4 sm:p-5 rounded-xl border border-neutral-300/80 dark:border-neutral-600 bg-white/80 dark:bg-neutral-900/40 text-center sm:text-left">
                      <Eye className="w-6 h-6 sm:w-7 sm:h-7 mb-2 sm:mb-3 mx-auto sm:mx-0 text-primary-600 dark:text-primary-400 transition-colors group-hover:text-primary-700 dark:group-hover:text-primary-300" />
                      <p className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">{user.lastViewedItems?.length || 0}</p>
                      <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">Items Viewed</p>
                    </div>
                  </div>
                </div>

                {user.lastViewedItems && user.lastViewedItems.length > 0 && (
                  <div className="text-center sm:text-left">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-3 sm:mb-4">Recently Viewed</h2>
                    <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">You've viewed {user.lastViewedItems.length} items recently</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-4">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-3 sm:mb-4 text-center">Order History</h2>
                {orders.length === 0 ? (
                  <div className="text-center py-8 sm:py-10 rounded-xl border border-neutral-300/80 dark:border-neutral-600 bg-white/80 dark:bg-neutral-900/40">
                    <Package className="w-12 h-12 sm:w-16 sm:h-16 text-primary-400/80 mx-auto mb-3 sm:mb-4" />
                    <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mb-3 sm:mb-4">No orders yet</p>
                    <Button href="/sections/shop" variant="default" size="sm" className="text-sm sm:text-base">
                      Start Shopping
                    </Button>
                  </div>
                ) : (
                  <ul className="list-none p-0 m-0 space-y-4 flex flex-col items-stretch max-w-5xl mx-auto w-full">
                    {orders.map((order) => {
                      const expanded = expandedOrderId === order.id
                      const qty = order.items.reduce((s, i) => s + i.quantity, 0)
                      return (
                        <li key={order.id} className="min-w-0 w-full">
                          <div className="w-full max-w-md mx-auto lg:max-w-none rounded-xl border border-neutral-300/80 dark:border-neutral-600 bg-white/80 dark:bg-neutral-900/50 shadow-md overflow-hidden flex flex-col">
                            <button
                              type="button"
                              onClick={() => setExpandedOrderId(expanded ? null : order.id)}
                              className="focus-ring-none text-center w-full p-4 sm:p-5 border-0 outline-none bg-transparent"
                            >
                              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Order</p>
                              <p className="font-bold text-neutral-900 dark:text-neutral-100 text-base sm:text-lg line-clamp-2">
                                {formatOrderReceiptDisplayName(order)}
                              </p>
                              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                                {new Date(order.timestamp).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                              <div className="flex flex-col items-center gap-1 mt-3 text-sm">
                                <span className="text-neutral-600 dark:text-neutral-400">
                                  Items: <strong className="text-neutral-900 dark:text-neutral-100">{qty}</strong>
                                </span>
                                <span className="text-neutral-600 dark:text-neutral-400">
                                  Total:{' '}
                                  <strong className="text-neutral-900 dark:text-neutral-100">UGX {order.total.toLocaleString()}</strong>
                                </span>
                              </div>
                              <span
                                className={`inline-block mt-3 px-2.5 py-1 rounded-full text-xs font-medium ${
                                  order.status === 'delivered'
                                    ? 'bg-green-100 text-green-800'
                                    : order.status === 'dispatched'
                                      ? 'bg-blue-100 text-blue-800'
                                      : order.status === 'confirmed'
                                        ? 'bg-primary-100 text-primary-800'
                                        : order.status === 'cancelled'
                                          ? 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200'
                                          : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {order.status}
                              </span>
                            </button>
                            {expanded ? (
                              <div className="relative px-4 sm:px-6 pt-0 pb-6 flex flex-col min-h-0 bg-transparent">
                                <div className="w-full shrink-0 my-3 sm:my-4 px-1" aria-hidden>
                                  <div className="h-px w-full bg-gradient-to-r from-transparent via-neutral-400/50 to-transparent dark:from-transparent dark:via-white/[0.14] dark:to-transparent" />
                                </div>
                                <ModalCloseButton
                                  onClose={() => setExpandedOrderId(null)}
                                  className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10"
                                  aria-label="Close details"
                                />
                                <div className="pt-8 sm:pt-7 pb-4 flex flex-col max-w-3xl mx-auto w-full">
                                  <h3 className="text-sm font-bold text-gray-900 dark:text-primary-100 mb-3 uppercase tracking-wide text-left">
                                    Customer Information
                                  </h3>
                                  <div className="space-y-2 text-sm text-gray-700 dark:text-primary-300 text-left">
                                    <p>
                                      <span className="text-gray-500 dark:text-primary-400">Email: </span>
                                      {order.customer.email}
                                    </p>
                                    <p>
                                      <span className="text-gray-500 dark:text-primary-400">Phone: </span>
                                      {order.customer.phone}
                                    </p>
                                    <p>
                                      <span className="text-gray-500 dark:text-primary-400">Address: </span>
                                      {order.customer.address.street}, {order.customer.address.city}
                                    </p>
                                  </div>
                                  <OrderItemsDetail order={order} />
                                  <div className="mt-6 flex justify-center">
                                    <Button
                                      href={`/order-confirmation?orderId=${order.id}`}
                                      variant="default"
                                      size="sm"
                                      className="inline-flex items-center gap-1.5"
                                    >
                                      <span>Full receipt</span>
                                      <span className="text-base leading-none">⟹</span>
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ) : null}
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-3 sm:mb-4 text-center">Write a Review</h2>
                  <form
                    onSubmit={handleReviewSubmit}
                    className="rounded-xl border border-neutral-300/80 dark:border-neutral-600 bg-white/80 dark:bg-neutral-900/40 p-4 sm:p-6 text-center sm:text-left"
                  >
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                          Rating
                        </label>
                        <div className="flex justify-center sm:justify-start space-x-2">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              type="button"
                              onClick={() => setReviewRating(rating)}
                              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                                rating <= reviewRating
                                  ? 'bg-primary-600 text-white'
                                  : 'bg-neutral-200 dark:bg-neutral-600 text-neutral-400'
                              }`}
                            >
                              <Star className="w-5 h-5" />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                          Your Review
                        </label>
                        <textarea
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          rows={4}
                          className="input-overlay w-full px-4 py-3 rounded-lg text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-all duration-300 dark:bg-neutral-800 dark:text-white"
                          placeholder="Share your experience with MysticalPIECES..."
                          required
                        />
                      </div>
                      <Button type="submit" variant="default" size="md" className="w-full sm:w-auto">
                        Submit Review
                      </Button>
                  </form>
                </div>

                <div>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-3 sm:mb-4 text-center">Your Reviews</h2>
                  <div className="rounded-xl border border-neutral-300/80 dark:border-neutral-600 bg-white/80 dark:bg-neutral-900/40 p-4 sm:p-6 text-center sm:text-left">
                      {user.reviews && user.reviews.length > 0 ? (
                        <div className="space-y-3 sm:space-y-4 flex flex-col items-center sm:items-stretch">
                          {user.reviews.map((review) => (
                            <div key={review.id} className="bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 sm:p-6 w-full max-w-2xl sm:max-w-none mx-auto sm:mx-0">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-5 h-5 ${
                                        i < review.rating
                                          ? 'text-yellow-400 fill-current'
                                          : 'text-neutral-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-neutral-700 dark:text-neutral-300">{review.text}</p>
                              {review.productName && (
                                <p className="text-sm text-primary-600 mt-2">Product: {review.productName}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-neutral-600 dark:text-neutral-400 text-center sm:text-left">No reviews yet</p>
                      )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>

        {/* Edit Profile Picture Modal */}
        <AnimatePresence>
          {showEditProfile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowEditProfile(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="hero-glass-frame relative flex w-full max-w-md max-h-[min(90vh,36rem)] flex-col overflow-hidden rounded-2xl backdrop-blur-lg bg-white/25 shadow-2xl dark:border-neutral-600 dark:bg-neutral-900/20"
              >
                <div className="hero-glass-frame-overlay pointer-events-none absolute inset-0 rounded-[inherit]" aria-hidden />
                <ModalCloseButton onClose={() => setShowEditProfile(false)} className="absolute top-2 right-2 z-40 shrink-0" aria-label="Close" />
                <div className="relative z-10 flex max-h-[min(90vh,36rem)] min-h-0 flex-1 flex-col overflow-hidden rounded-bl-2xl rounded-tl-2xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-800">
                <div className="modal-scrollbar min-h-0 flex-1 overflow-y-auto p-8 pt-10 sm:pt-8 sm:pb-6">
                <h2 className="mb-6 text-2xl font-bold text-primary-800 dark:text-primary-100">
                  Edit Profile Picture
                </h2>

                <div className="flex flex-col items-center space-y-6">
                  <div className="relative">
                    {profileImage ? (
                      <div className="relative">
                        <img
                          src={profileImage}
                          alt="Profile preview"
                          className="w-32 h-32 rounded-full object-cover border-4 border-primary-200 dark:border-neutral-600"
                        />
                        <Button type="button" variant="filled" size="icon" onClick={handleRemoveImage} className="absolute -top-2 -right-2 w-8 h-8 min-w-0 !border-red-500 !bg-red-500 hover:!bg-red-600">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-primary-100 dark:bg-neutral-700 border-4 border-dashed border-primary-300 dark:border-neutral-600 flex items-center justify-center">
                        <Camera className="w-16 h-16 text-primary-400" />
                      </div>
                    )}
                  </div>

                  <div className="w-full">
                    <input ref={profileFileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <Button variant="default" size="md" type="button" onClick={() => profileFileInputRef.current?.click()} className="w-full justify-center">
                      {profileImage ? 'Change Photo' : 'Upload Photo'}
                    </Button>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 text-center">
                      Max 5MB, JPG/PNG
                    </p>
                  </div>

                  <div className="flex w-full justify-center">
                    <Button variant="filled" size="md" onClick={handleSaveProfile} className="min-w-[12rem] justify-center">
                      Save Changes
                    </Button>
                  </div>
                </div>
                </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}


