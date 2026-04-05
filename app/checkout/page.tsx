'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { CartManager, OrderManager, calculateDeliveryFee, isKampalaAddress, type CartItem, type Order } from '@/lib/cart'
import Button from '@/components/ui/Button'
import { EmailTemplates } from '@/lib/emails/templates'
import { WhatsAppNotifications } from '@/lib/whatsapp/notifications'
import { AuthManager } from '@/lib/auth'
import SafeImage from '@/components/common/SafeImage'

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    notes: '',
    deliveryOption: 'kampala' as 'kampala' | 'outside'
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setCart(CartManager.getCart())
    
    // Auto-fill user info if logged in
    const user = AuthManager.getCurrentUser()
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone
      }))
    }
    
    // Auto-detect delivery option based on address
    if (formData.city && isKampalaAddress(formData.city)) {
      setFormData(prev => ({ ...prev, deliveryOption: 'kampala' }))
    }
  }, [formData.city])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!formData.street.trim()) newErrors.street = 'Street address is required'
    if (!formData.city.trim()) newErrors.city = 'City/Area is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    if (cart.length === 0) {
      alert('Your cart is empty!')
      return
    }
    
    setIsSubmitting(true)
    
    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const deliveryFee = calculateDeliveryFee(formData.deliveryOption, formData.city)
    const total = subtotal + deliveryFee
    
    const orderPayload = {
      userId: AuthManager.getCurrentUser()?.id ?? null,
      customer: {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: {
          street: formData.street,
          city: formData.city
        }
      },
      items: cart.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        image: item.image,
        sku: item.sku
      })),
      subtotal,
      deliveryFee,
      total,
      deliveryOption: formData.deliveryOption,
      notes: formData.notes || undefined
    }

    let order: Order
    const apiRes = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    })
    if (apiRes.ok) {
      order = await apiRes.json()
      OrderManager.addOrder(order)
    } else {
      order = OrderManager.createOrder({
        customer: orderPayload.customer,
        items: cart,
        subtotal,
        deliveryFee,
        total,
        deliveryOption: formData.deliveryOption,
        notes: formData.notes || undefined,
        status: 'pending'
      })
    }
    
    // Send notifications (async, don't wait for completion)
    try {
      // Send emails
      await Promise.all([
        EmailTemplates.sendEmail(EmailTemplates.buyerConfirmation(order)),
        EmailTemplates.sendEmail(EmailTemplates.sellerNotification(order))
      ])
      
      // Send WhatsApp messages
      // Business WhatsApp notification (always send)
      await WhatsAppNotifications.sendWhatsApp(
        WhatsAppNotifications.businessNotification(order)
      )
      
      // Customer WhatsApp notification (if phone is on WhatsApp)
      const isOnWhatsApp = await WhatsAppNotifications.isPhoneOnWhatsApp(order.customer.phone)
      if (isOnWhatsApp) {
        await WhatsAppNotifications.sendWhatsApp(
          WhatsAppNotifications.customerConfirmation(order)
        )
      }
    } catch (error) {
      console.error('Error sending notifications:', error)
      // Don't block order confirmation if notifications fail
    }
    
    // Clear cart
    CartManager.clearCart()
    
    // Redirect to confirmation page
    window.location.href = `/order-confirmation?orderId=${order.id}`
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const deliveryFee = calculateDeliveryFee(formData.deliveryOption, formData.city)
  const total = subtotal + deliveryFee

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
      {/* Fixed Back Button */}
      <motion.div
        animate={{ opacity: showBackButton ? 1 : 0, x: showBackButton ? 0 : -120, y: showBackButton ? 0 : -20 }}
        transition={{ duration: 0.3 }}
        className="fixed top-20 left-4 sm:left-8 z-50 pointer-events-none"
        style={{ pointerEvents: showBackButton ? 'auto' : 'none' }}
      >
        <Link href="/sections/shop" className="focus-ring-none inline-flex items-center gap-2 text-primary-600 dark:text-primary-300 hover:text-primary-800 dark:hover:text-primary-100 transition-colors duration-300">
          <span className="btn-unified-circle flex-shrink-0">⟸</span>
          <span className="text-sm font-medium">Back to Shopping</span>
        </Link>
      </motion.div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-primary-50 mb-2">Checkout</h1>
          <p className="text-neutral-600 dark:text-primary-300">Complete your order with secure checkout</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-8 max-w-full md:max-w-6xl mx-auto">
          {/* Order Summary */}
          <div className="md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="w-full"
            >
              <div className="hero-glass-frame relative backdrop-blur-lg">
                <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none" aria-hidden />
              <div className="bg-white dark:bg-primary-800/30 rounded-xl border border-neutral-200 dark:border-primary-500/30 p-4 sm:p-6 md:p-8 shadow-xl dark:shadow-xl">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-primary-50 mb-6">Order Details</h2>
              
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 mx-auto text-neutral-300 dark:text-primary-500/50 mb-4" />
                  <p className="text-neutral-600 dark:text-primary-400 text-lg">Your cart is empty</p>
                  <div className="hero-cta-buttons flex justify-center mt-4">
                    <Button
                      href="/sections/shop"
                      variant="default"
                      size="md"
                      className="inline-flex items-center justify-center"
                    >
                      Start Shopping
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item, index) => (
                    <div key={index}>
                      <div className="flex items-start space-x-3 sm:space-x-4 pb-4">
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-neutral-100 dark:bg-primary-900/20 rounded-lg overflow-hidden flex-shrink-0">
                          <SafeImage
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                            loading="lazy"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-neutral-900 dark:text-primary-50 font-medium text-sm sm:text-base truncate">{item.name}</h3>
                          <p className="text-neutral-600 dark:text-primary-400 text-xs sm:text-sm truncate">{item.sku}</p>
                          {item.size && <p className="text-neutral-700 dark:text-primary-300 text-xs sm:text-sm">Size: {item.size}</p>}
                          {item.color && <p className="text-neutral-700 dark:text-primary-300 text-xs sm:text-sm">Color: {item.color}</p>}
                          <p className="text-neutral-600 dark:text-primary-300 text-xs sm:text-sm">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-neutral-900 dark:text-primary-50 font-bold text-sm sm:text-base">
                            UGX {(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {index < cart.length - 1 && (
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-600 to-transparent my-4"></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              </div>
              </div>
            </motion.div>

            {/* Customer Information Form */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onSubmit={handleSubmit}
              className="mt-8 w-full"
            >
              <div className="hero-glass-frame relative backdrop-blur-lg">
                <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none" aria-hidden />
              <div className="bg-white dark:bg-primary-800/30 rounded-xl border border-neutral-200 dark:border-primary-500/30 p-8 shadow-xl dark:shadow-xl">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-primary-50 mb-6">Customer Information</h2>
              
              <div className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-neutral-700 dark:text-primary-300 font-medium mb-2">
                    Full Name <span className="text-red-500 dark:text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="input-overlay w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && <p className="mt-1 text-red-500 dark:text-red-400 text-sm">{errors.fullName}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-neutral-700 dark:text-primary-300 font-medium mb-2">
                    Email <span className="text-red-500 dark:text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-overlay w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                    placeholder="your.email@example.com"
                  />
                  {errors.email && <p className="mt-1 text-red-500 dark:text-red-400 text-sm">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-neutral-700 dark:text-primary-300 font-medium mb-2">
                    Phone Number <span className="text-red-500 dark:text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-overlay w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                    placeholder="+256 700 000 000"
                  />
                  {errors.phone && <p className="mt-1 text-red-500 dark:text-red-400 text-sm">{errors.phone}</p>}
                </div>

                {/* Street Address */}
                <div>
                  <label className="block text-neutral-700 dark:text-primary-300 font-medium mb-2">
                    Street Address <span className="text-red-500 dark:text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    className="input-overlay w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                    placeholder="Street, Building, House Number"
                  />
                  {errors.street && <p className="mt-1 text-red-500 dark:text-red-400 text-sm">{errors.street}</p>}
                </div>

                {/* City/Area */}
                <div>
                  <label className="block text-neutral-700 dark:text-primary-300 font-medium mb-2">
                    City / Area <span className="text-red-500 dark:text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="input-overlay w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                    placeholder="Kampala, Mukono, etc."
                  />
                  {errors.city && <p className="mt-1 text-red-500 dark:text-red-400 text-sm">{errors.city}</p>}
                </div>

                {/* Delivery Option */}
                <div>
                  <label className="block text-neutral-700 dark:text-primary-300 font-medium mb-3">
                    Delivery Option
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 p-4 bg-neutral-100 dark:bg-primary-800/30 border border-neutral-300 dark:border-primary-500/30 rounded-lg cursor-pointer hover:bg-neutral-200 dark:hover:bg-primary-800/50 transition-colors">
                      <input
                        type="radio"
                        name="delivery"
                        value="kampala"
                        checked={formData.deliveryOption === 'kampala'}
                        onChange={(e) => setFormData({ ...formData, deliveryOption: e.target.value as 'kampala' | 'outside' })}
                        className="w-4 h-4 text-primary-600 dark:text-primary-500 accent-primary-600 dark:accent-primary-400"
                      />
                      <div className="flex-1">
                        <p className="text-neutral-900 dark:text-white font-medium">Kampala (Free Delivery)</p>
                        <p className="text-neutral-600 dark:text-primary-400 text-sm">Delivery within Kampala city limits</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center space-x-3 p-4 bg-neutral-100 dark:bg-primary-800/30 border border-neutral-300 dark:border-primary-500/30 rounded-lg cursor-pointer hover:bg-neutral-200 dark:hover:bg-primary-800/50 transition-colors">
                      <input
                        type="radio"
                        name="delivery"
                        value="outside"
                        checked={formData.deliveryOption === 'outside'}
                        onChange={(e) => setFormData({ ...formData, deliveryOption: e.target.value as 'kampala' | 'outside' })}
                        className="w-4 h-4 text-primary-600 dark:text-primary-500 accent-primary-600 dark:accent-primary-400"
                      />
                      <div className="flex-1">
                        <p className="text-neutral-900 dark:text-primary-50 font-medium">Outside Kampala</p>
                        <p className="text-neutral-600 dark:text-primary-400 text-sm">Transport fee: UGX {deliveryFee.toLocaleString()}</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-neutral-700 dark:text-primary-300 font-medium mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                    className="input-overlay w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 resize-none"
                    placeholder="Any special instructions for delivery..."
                  />
                </div>
              </div>
              </div>
              </div>
            </motion.form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="md:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="sticky top-24 w-full"
            >
              <div className="hero-glass-frame relative backdrop-blur-lg">
                <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none" aria-hidden />
              <div className="bg-white dark:bg-primary-800/30 rounded-xl border border-neutral-200 dark:border-primary-500/30 p-4 sm:p-6 shadow-xl dark:shadow-xl">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-primary-50 mb-4">Order Summary</h2>
              
              <div className="space-y-4 pb-4 border-b border-neutral-200 dark:border-primary-600/50">
                <div className="flex justify-between text-neutral-700 dark:text-primary-300">
                  <span>Subtotal</span>
                  <span>UGX {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-neutral-700 dark:text-primary-300">
                  <span>Delivery</span>
                  <span>{deliveryFee === 0 ? 'Free' : `UGX ${deliveryFee.toLocaleString()}`}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center py-4">
                <span className="text-xl font-bold text-neutral-900 dark:text-primary-50">Total</span>
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-300">
                  UGX {total.toLocaleString()}
                </span>
              </div>

              <div className="hero-cta-buttons">
                <Button
                  variant="filled"
                  size="md"
                  onClick={handleSubmit}
                  disabled={isSubmitting || cart.length === 0}
                  className="w-full justify-center"
                >
                  {isSubmitting ? 'Processing...' : 'Confirm Order'}
                </Button>
              </div>

              <p className="text-neutral-600 dark:text-primary-400 text-sm text-center mt-4">
                ✓ Pay on Delivery Available
              </p>
              </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

