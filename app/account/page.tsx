'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Package, Eye, Star, MessageSquare, User, Mail, Phone, Edit2, Camera, X } from 'lucide-react'
import { AuthManager } from '@/lib/auth'
import { OrderManager, type Order } from '@/lib/cart'
import type { User as UserType, Review } from '@/lib/auth'
import { AnimatePresence } from 'framer-motion'

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
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
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

  const handleSaveProfile = () => {
    if (!user) return
    
    if (AuthManager.updateUser(user.id, { profileImage })) {
      const updatedUser = AuthManager.getCurrentUser()
      if (updatedUser) {
        setUser(updatedUser)
      }
      setShowEditProfile(false)
      setProfileImageFile(null)
      alert('Profile picture updated successfully!')
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
        animate={{ opacity: showBackButton ? 1 : 0, y: showBackButton ? 0 : -20 }}
        transition={{ duration: 0.3 }}
        className="fixed top-20 left-8 z-50 pointer-events-none"
        style={{ pointerEvents: showBackButton ? 'auto' : 'none' }}
      >
        <Link href="/" className="inline-flex items-center space-x-2 text-primary-600 dark:text-primary-300 hover:text-primary-800 dark:hover:text-primary-100 transition-colors duration-300">
          <span className="text-base font-medium">⟸</span>
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
      </motion.div>
      <div className="container-custom mt-12">

        <div className="hero-glass-frame relative backdrop-blur-lg max-w-5xl mx-auto">
          <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none" aria-hidden />
        <div className="relative z-10 bg-white/95 dark:bg-neutral-800 rounded-2xl shadow-xl overflow-hidden border border-neutral-200 dark:border-neutral-700">
          {/* Header */}
          <div className="bg-neutral-50 dark:bg-neutral-700 border-b border-neutral-200 dark:border-neutral-600 p-8">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-3xl font-bold bg-neutral-100 dark:bg-neutral-700">
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
                <button
                  onClick={() => {
                    setShowEditProfile(true)
                    setProfileImage(user.profileImage || '')
                  }}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 dark:bg-primary-500 hover:bg-primary-700 dark:hover:bg-primary-400 rounded-full flex items-center justify-center border-2 border-white dark:border-neutral-800 transition-colors shadow-md"
                  title="Edit profile picture"
                >
                  <Camera className="w-4 h-4 text-white" />
                </button>
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{user.fullName}</h1>
                <p className="text-neutral-600 dark:text-neutral-400">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-neutral-200 dark:border-neutral-700 flex">
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
                  className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 transition-colors ${
                    activeTab === tab.id
                      ? 'border-b-2 border-primary-600 text-primary-600 font-medium'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-primary-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Content */}
          <div className="p-8">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Account Information</h2>
                  <div className="hero-glass-frame relative backdrop-blur-lg rounded-2xl max-w-4xl mx-auto">
                    <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                      <div className="flex items-center space-x-3 p-4 bg-white/90 dark:bg-neutral-700 rounded-xl border border-neutral-200 dark:border-neutral-600 shadow-sm">
                        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                          <Mail className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Email</p>
                          <p className="font-medium text-neutral-900 dark:text-neutral-200">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-4 bg-neutral-50 dark:bg-neutral-700 rounded-xl border border-neutral-200 dark:border-neutral-600 shadow-sm">
                        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                          <Phone className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Phone</p>
                          <p className="font-medium text-neutral-900 dark:text-neutral-200">{user.phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Quick Stats</h2>
                  <div className="hero-glass-frame relative backdrop-blur-lg rounded-2xl max-w-4xl mx-auto">
                    <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                      <div className="p-6 bg-white/95 dark:bg-neutral-700 rounded-xl border border-neutral-200 dark:border-neutral-600 shadow-sm">
                        <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg w-fit mb-3">
                          <Package className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                        </div>
                        <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{orders.length}</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Orders</p>
                      </div>
                      <div className="p-6 bg-neutral-50 dark:bg-neutral-700 rounded-xl border border-neutral-200 dark:border-neutral-600 shadow-sm">
                        <div className="p-3 bg-accent-100 dark:bg-accent-900/30 rounded-lg w-fit mb-3">
                          <Star className="w-8 h-8 text-accent-600 dark:text-accent-400" />
                        </div>
                        <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{user.reviews?.length || 0}</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Reviews Written</p>
                      </div>
                      <div className="p-6 bg-neutral-100 dark:bg-neutral-700 rounded-xl border border-neutral-200 dark:border-neutral-600 shadow-sm">
                        <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg w-fit mb-3">
                          <Eye className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                        </div>
                        <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{user.lastViewedItems?.length || 0}</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Items Viewed</p>
                      </div>
                    </div>
                  </div>
                </div>

                {user.lastViewedItems && user.lastViewedItems.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Recently Viewed</h2>
                    <p className="text-neutral-600 dark:text-neutral-400">You've viewed {user.lastViewedItems.length} items recently</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Order History</h2>
                <div className="hero-glass-frame relative backdrop-blur-lg rounded-2xl max-w-4xl mx-auto">
                  <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
                  <div className="relative z-10 p-6">
                    {orders.length === 0 ? (
                      <div className="text-center py-10">
                        <Package className="w-16 h-16 text-primary-400/80 mx-auto mb-4" />
                        <p className="text-neutral-600 dark:text-neutral-400 mb-4">No orders yet</p>
                        <Link href="/sections/shop" className="btn btn-outline btn-hover-secondary-filled">
                          Start Shopping
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/95 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 hover:shadow-lg transition-shadow"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="font-bold text-lg">Order {order.id}</h3>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                  {new Date(order.timestamp).toLocaleDateString()}
                                </p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
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
                            <Link href={`/order-confirmation?id=${order.id}`} className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                              View Details →
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Write a Review</h2>
                  <div className="hero-glass-frame relative backdrop-blur-lg rounded-2xl max-w-3xl mx-auto">
                    <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
                    <form onSubmit={handleReviewSubmit} className="relative z-10 bg-primary-50 dark:bg-neutral-700 rounded-xl p-6">
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                          Rating
                        </label>
                        <div className="flex space-x-2">
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
                          className="w-full px-4 py-3 border border-primary-200 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-800 dark:text-white"
                          placeholder="Share your experience with MysticalPIECES..."
                          required
                        />
                      </div>
                      <button type="submit" className="btn btn-outline btn-hover-secondary-filled">
                        Submit Review
                      </button>
                    </form>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Your Reviews</h2>
                  <div className="hero-glass-frame relative backdrop-blur-lg rounded-2xl max-w-3xl mx-auto">
                    <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
                    <div className="relative z-10">
                      {user.reviews && user.reviews.length > 0 ? (
                        <div className="space-y-4">
                          {user.reviews.map((review) => (
                            <div key={review.id} className="bg-white/95 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6">
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
                        <p className="text-neutral-600 dark:text-neutral-400">No reviews yet</p>
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
                  <button
                    onClick={() => setShowEditProfile(false)}
                    className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                  >
                    <X className="w-6 h-6" />
                  </button>
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
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-primary-100 dark:bg-neutral-700 border-4 border-dashed border-primary-300 dark:border-neutral-600 flex items-center justify-center">
                        <Camera className="w-16 h-16 text-primary-400" />
                      </div>
                    )}
                  </div>

                  <div className="w-full">
                    <label className="cursor-pointer block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <div className="btn btn-outline btn-hover-secondary-filled w-full justify-center">
                        {profileImage ? 'Change Photo' : 'Upload Photo'}
                      </div>
                    </label>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 text-center">
                      Max 5MB, JPG/PNG
                    </p>
                  </div>

                  <div className="flex space-x-4 w-full">
                    <button
                      onClick={() => {
                        setShowEditProfile(false)
                        setProfileImage(user.profileImage || '')
                        setProfileImageFile(null)
                      }}
                      className="btn btn-outline btn-hover-secondary-filled flex-1 justify-center"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className="btn btn-primary btn-hover-secondary-filled flex-1 justify-center"
                    >
                      Save Changes
                    </button>
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


