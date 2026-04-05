'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Package, Eye, Star, MessageSquare, User, Mail, Phone, Edit2, Camera, X } from 'lucide-react'
import { AuthManager } from '@/lib/auth'
import { OrderManager, type Order } from '@/lib/cart'
import type { User as UserType, Review } from '@/lib/auth'
import { AnimatePresence } from 'framer-motion'
import Button from '@/components/ui/Button'
import ModalCloseButton from '@/components/ui/ModalCloseButton'
import { SkeletonAccountPage } from '@/components/ui/Skeleton'

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
  const router = useRouter()
  const profileFileInputRef = useRef<HTMLInputElement>(null)

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
      // Update user to get new reviews
      const updatedUser = AuthManager.getCurrentUser()
      if (updatedUser) setUser(updatedUser)
      alert('Thank you for your review! It will appear on the homepage testimonials.')
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

          {/* Tabs - scroll on small screens */}
          <div className="border-b border-neutral-200 dark:border-neutral-700 flex overflow-x-auto scrollbar-hide">
            {[
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'orders', label: 'Orders', icon: Package },
              { id: 'reviews', label: 'Reviews', icon: Star }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 min-w-[100px] sm:min-w-0 flex items-center justify-center gap-1.5 sm:gap-2 py-3 sm:py-4 px-3 sm:px-6 transition-colors text-sm sm:text-base ${
                    activeTab === tab.id
                      ? 'border-b-2 border-primary-600 text-primary-600 font-medium'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-primary-600'
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 md:p-8">
            {activeTab === 'overview' && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-3 sm:mb-4 text-center">Account Information</h2>
                  <div className="hero-glass-frame relative backdrop-blur-lg rounded-xl sm:rounded-2xl">
                    <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
                    <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4">
                      <div className="flex items-center gap-3 p-3 sm:p-4 bg-neutral-200/60 dark:bg-neutral-700 rounded-xl border border-neutral-300/80 dark:border-neutral-600">
                        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex-shrink-0">
                          <Mail className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">Email</p>
                          <p className="font-medium text-sm sm:text-base text-neutral-900 dark:text-neutral-200 truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 sm:p-4 bg-neutral-300/50 dark:bg-neutral-700 rounded-xl border border-neutral-300/80 dark:border-neutral-600">
                        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex-shrink-0">
                          <Phone className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">Phone</p>
                          <p className="font-medium text-sm sm:text-base text-neutral-900 dark:text-neutral-200">{user.phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-3 sm:mb-4 text-center">Quick Stats</h2>
                  <div className="hero-glass-frame relative backdrop-blur-lg rounded-xl sm:rounded-2xl">
                    <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
                    <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-4 justify-items-center sm:justify-items-stretch">
                      {/* Total Orders */}
                      <div className="hero-glass-frame hero-glass-frame-compact relative backdrop-blur-sm rounded-xl w-full max-w-xs sm:max-w-none">
                        <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
                        <div className="relative z-10 p-4 sm:p-6 bg-neutral-200/60 dark:bg-neutral-700 rounded-xl border border-neutral-300/80 dark:border-neutral-600 text-center sm:text-left">
                          <div className="p-2 sm:p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg w-fit mb-2 sm:mb-3 mx-auto sm:mx-0">
                            <Package className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600 dark:text-primary-400" />
                          </div>
                          <p className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">{orders.length}</p>
                          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">Total Orders</p>
                        </div>
                      </div>
                      {/* Reviews Written */}
                      <div className="hero-glass-frame hero-glass-frame-compact relative backdrop-blur-sm rounded-xl w-full max-w-xs sm:max-w-none">
                        <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
                        <div className="relative z-10 p-4 sm:p-6 bg-neutral-300/50 dark:bg-neutral-700 rounded-xl border border-neutral-300/80 dark:border-neutral-600 text-center sm:text-left">
                          <div className="p-2 sm:p-3 bg-accent-100 dark:bg-accent-900/30 rounded-lg w-fit mb-2 sm:mb-3 mx-auto sm:mx-0">
                            <Star className="w-6 h-6 sm:w-8 sm:h-8 text-accent-600 dark:text-accent-400" />
                          </div>
                          <p className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">{user.reviews?.length || 0}</p>
                          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">Reviews Written</p>
                        </div>
                      </div>
                      {/* Items Viewed */}
                      <div className="hero-glass-frame hero-glass-frame-compact relative backdrop-blur-sm rounded-xl w-full max-w-xs sm:max-w-none">
                        <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
                        <div className="relative z-10 p-4 sm:p-6 bg-neutral-200/70 dark:bg-neutral-700 rounded-xl border border-neutral-300/80 dark:border-neutral-600 text-center sm:text-left">
                          <div className="p-2 sm:p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg w-fit mb-2 sm:mb-3 mx-auto sm:mx-0">
                            <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600 dark:text-primary-400" />
                          </div>
                          <p className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">{user.lastViewedItems?.length || 0}</p>
                          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">Items Viewed</p>
                        </div>
                      </div>
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
                <div className="hero-glass-frame relative backdrop-blur-lg rounded-xl sm:rounded-2xl">
                  <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
                  <div className="relative z-10 p-4 sm:p-6 text-center sm:text-left">
                    {orders.length === 0 ? (
                      <div className="text-center py-8 sm:py-10">
                        <Package className="w-12 h-12 sm:w-16 sm:h-16 text-primary-400/80 mx-auto mb-3 sm:mb-4" />
                        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mb-3 sm:mb-4">No orders yet</p>
                        <Button href="/sections/shop" variant="default" size="sm" className="text-sm sm:text-base">
                          Start Shopping
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3 sm:space-y-4 flex flex-col items-center sm:items-stretch">
                        {orders.map((order) => (
                          <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="hero-glass-frame hero-glass-frame-compact relative backdrop-blur-lg rounded-xl hover:shadow-lg transition-shadow w-full max-w-2xl sm:max-w-none"
                          >
                            <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
                            <div className="relative z-10 bg-neutral-200/60 dark:bg-neutral-800 border border-neutral-300/80 dark:border-neutral-700 rounded-xl p-4 sm:p-6">
                              <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-3 sm:mb-4">
                                <div>
                                  <h3 className="font-bold text-base sm:text-lg">Order {order.id}</h3>
                                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                                    {new Date(order.timestamp).toLocaleDateString()}
                                  </p>
                                </div>
                                <span className={`px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex-shrink-0 ${
                                  order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                  order.status === 'dispatched' ? 'bg-blue-100 text-blue-800' :
                                  order.status === 'confirmed' ? 'bg-primary-100 text-primary-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Items</p>
                                  <p className="font-medium">{order.items.length}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Total</p>
                                  <p className="font-medium">UGX {order.total.toLocaleString()}</p>
                                </div>
                              </div>
                              <Button
                                href={`/order-confirmation?id=${order.id}`}
                                variant="default"
                                size="sm"
                                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium mt-1.5"
                              >
                                <span>View Details</span>
                                <span className="text-base leading-none">⟹</span>
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-3 sm:mb-4 text-center">Write a Review</h2>
                  <div className="hero-glass-frame relative backdrop-blur-lg rounded-xl sm:rounded-2xl">
                    <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
                    <form onSubmit={handleReviewSubmit} className="relative z-10 bg-neutral-200/60 dark:bg-neutral-700 rounded-xl p-4 sm:p-6 text-center sm:text-left">
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
                          className="input-overlay w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-all duration-300 dark:bg-neutral-800 dark:text-white"
                          placeholder="Share your experience with MysticalPIECES..."
                          required
                        />
                      </div>
                      <Button type="submit" variant="default" size="md" className="w-full sm:w-auto">
                        Submit Review
                      </Button>
                    </form>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-3 sm:mb-4 text-center">Your Reviews</h2>
                  <div className="hero-glass-frame relative backdrop-blur-lg rounded-xl sm:rounded-2xl">
                    <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
                    <div className="relative z-10 text-center sm:text-left">
                      {user.reviews && user.reviews.length > 0 ? (
                        <div className="space-y-3 sm:space-y-4 flex flex-col items-center sm:items-stretch">
                          {user.reviews.map((review) => (
                            <div key={review.id} className="bg-neutral-200/60 dark:bg-neutral-800 border border-neutral-300/80 dark:border-neutral-700 rounded-xl p-4 sm:p-6 w-full max-w-2xl sm:max-w-none mx-auto sm:mx-0">
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
                className="bg-white dark:bg-neutral-800 rounded-2xl p-8 max-w-md w-full shadow-xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-primary-800 dark:text-primary-100">
                    Edit Profile Picture
                  </h2>
                  <ModalCloseButton onClose={() => setShowEditProfile(false)} className="flex-shrink-0" aria-label="Close" />
                </div>

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

                  <div className="flex space-x-4 w-full">
                    <Button variant="default" size="md" onClick={() => { setShowEditProfile(false); setProfileImage(user.profileImage || ''); setProfileImageFile(null) }} className="flex-1 justify-center">
                      Cancel
                    </Button>
                    <Button variant="filled" size="md" onClick={handleSaveProfile} className="flex-1 justify-center">
                      Save Changes
                    </Button>
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


