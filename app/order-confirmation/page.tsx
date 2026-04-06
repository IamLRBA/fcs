'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { CheckCircle, Download, Home, Package } from 'lucide-react'
import { OrderManager, type Order } from '@/lib/cart'
import { downloadReceipt, generateReceiptImage } from '@/lib/utils/receipt-generator'
import { EmailTemplates } from '@/lib/emails/templates'
import { WhatsAppNotifications } from '@/lib/whatsapp/notifications'
import MysticalPiecesWord from '@/components/ui/MysticalPiecesWord'
import Button from '@/components/ui/Button'
import SafeImage from '@/components/common/SafeImage'

export default function OrderConfirmationPage() {
  const [order, setOrder] = useState<Order | null>(null)
  const [orderId, setOrderId] = useState<string>('')
  const [isDownloading, setIsDownloading] = useState(false)
  const [notificationsSent, setNotificationsSent] = useState(false)
  const receiptRef = useRef<HTMLDivElement>(null)

  // Validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Validate phone number format (basic check)
  const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^[\d\s\+\-\(\)]{10,}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }

  // Send order notifications (email and WhatsApp)
  const sendOrderNotifications = async () => {
    if (!order || notificationsSent || !receiptRef.current) return

    try {
      // Generate receipt image
      const receiptImage = await generateReceiptImage(receiptRef.current, {
        width: 800,
        backgroundColor: '#ffffff'
      })

      // Validate customer email and phone
      const customerEmail = order.customer?.email || ''
      const customerPhone = order.customer?.phone || ''

      // Send customer email with receipt if email is valid
      if (customerEmail && isValidEmail(customerEmail)) {
        try {
          const customerEmailConfig = EmailTemplates.buyerConfirmation(order, receiptImage)
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customerEmailConfig)
          })
          console.log('Customer email sent successfully')
        } catch (error) {
          console.error('Error sending customer email:', error)
        }
      }

      // Send customer WhatsApp if phone is valid
      if (customerPhone && isValidPhone(customerPhone)) {
        try {
          const customerWhatsApp = WhatsAppNotifications.customerConfirmation(order, receiptImage)
          await fetch('/api/send-whatsapp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customerWhatsApp)
          })
          console.log('Customer WhatsApp sent successfully')
        } catch (error) {
          console.error('Error sending customer WhatsApp:', error)
        }
      }

      // Send admin email
      try {
        const adminEmailConfig = EmailTemplates.sellerNotification(order)
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(adminEmailConfig)
        })
        console.log('Admin email sent successfully')
      } catch (error) {
        console.error('Error sending admin email:', error)
      }

      // Send admin WhatsApp
      try {
        const adminWhatsApp = WhatsAppNotifications.businessNotification(order)
        await fetch('/api/send-whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(adminWhatsApp)
        })
        console.log('Admin WhatsApp sent successfully')
      } catch (error) {
        console.error('Error sending admin WhatsApp:', error)
      }

      setNotificationsSent(true)
    } catch (error) {
      console.error('Error sending notifications:', error)
    }
  }

  useEffect(() => {
    // Get order ID from URL params
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const id = params.get('orderId')
      if (id) {
        setOrderId(id)
        const foundOrder = OrderManager.getOrderById(id)
        setOrder(foundOrder || null)
      }
    }
  }, [])

  // Send notifications when order and receipt are ready
  useEffect(() => {
    if (order && receiptRef.current && !notificationsSent) {
      // Small delay to ensure receipt is fully rendered
      const timer = setTimeout(() => {
        sendOrderNotifications()
      }, 1000)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, notificationsSent])

  const handleDownloadReceipt = async () => {
    if (!receiptRef.current || !order) return
    
    setIsDownloading(true)
    try {
      await downloadReceipt(receiptRef.current, order.id, {
        width: 800,
        backgroundColor: '#ffffff'
      })
    } catch (error) {
      console.error('Error downloading receipt:', error)
      alert('Failed to download receipt. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-unified">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-neutral-850 dark:text-primary-50 mb-4">Order Not Found</h1>
          <p className="text-primary-700 dark:text-primary-400 mb-8">We couldn't find an order with that ID.</p>
          <Button href="/sections/shop" variant="filled">
            Continue Shopping
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-unified py-20 px-4 print:bg-white print:py-0">
      <div className="max-w-4xl mx-auto">
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: 'spring' }}
          className="flex justify-center mb-8 print:hidden"
        >
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-neutral-850 dark:text-white" />
          </div>
        </motion.div>

        {/* Confirmation Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12 print:mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-850 dark:text-primary-50 mb-4 print:text-gray-900">
            Order Confirmed!
          </h1>
          <p className="text-xl text-neutral-700 dark:text-primary-300 print:text-gray-600 mb-2">
            Thank you for your order. We've received your order and will process it shortly.
          </p>
          {notificationsSent && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">
              ✓ Confirmation email and WhatsApp sent to your contact details
            </p>
          )}
        </motion.div>

        {/* Order Receipt - semi-transparent glass container for details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="hero-glass-frame relative backdrop-blur-lg mx-auto max-w-2xl rounded-2xl sm:rounded-3xl"
        >
          <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
          <motion.div
            ref={receiptRef}
            data-receipt
            className="bg-white dark:bg-neutral-800 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 receipt-container border border-neutral-200 dark:border-neutral-700"
            style={{
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
          >
            {/* Receipt Header */}
            <div className="text-center mb-8 pb-6 border-b-2 border-gray-200 dark:border-neutral-600">
              <div className="mb-4">
                <h1
                  className="text-3xl font-bold text-gray-900 dark:text-primary-100 mb-2"
                  style={{ letterSpacing: '0.5px' }}
                >
                  <MysticalPiecesWord />
                </h1>
                <p className="text-gray-600 dark:text-primary-300 text-sm">
                  Mystical Thrift Fashion & Soulful Style Curators
                </p>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm text-gray-600 dark:text-primary-300">
                <div className="text-left w-full sm:w-auto">
                  <p className="font-semibold text-gray-900 dark:text-primary-100">Order Receipt</p>
                  <p className="mt-1 dark:text-primary-300 break-all">{order.id}</p>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto">
                  <p className="font-semibold text-gray-900 dark:text-primary-100">Date</p>
                  <p className="mt-1 dark:text-primary-300">
                    {new Date(order.timestamp).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="mb-6 pb-6 border-b border-gray-200 dark:border-neutral-600">
              <h3 className="text-lg font-bold text-gray-900 dark:text-primary-100 mb-3 uppercase tracking-wide text-sm">
                Customer Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span className="text-gray-600 dark:text-primary-300">Name:</span>
                  <span className="text-gray-900 dark:text-primary-100 font-medium">{order.customer.fullName}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span className="text-gray-600 dark:text-primary-300">Phone:</span>
                  <span className="text-gray-900 dark:text-primary-100 font-medium">{order.customer.phone}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span className="text-gray-600 dark:text-primary-300">Email:</span>
                  <span className="text-gray-900 dark:text-primary-100 font-medium text-xs break-all">
                    {order.customer.email}
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-neutral-700">
                  <p className="text-gray-600 dark:text-primary-300 text-xs mb-1">Delivery Address:</p>
                  <p className="text-gray-900 dark:text-primary-100 font-medium text-sm">
                    {order.customer.address.street}
                    <br />
                    {order.customer.address.city}
                  </p>
                </div>
              </div>
            </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-primary-100 mb-4 uppercase tracking-wide text-sm">
              Items Ordered
            </h3>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index}>
                  <div className="flex items-start justify-between pb-4">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="relative w-20 h-20 bg-gray-100 dark:bg-neutral-700 rounded-md overflow-hidden flex-shrink-0 border border-gray-200 dark:border-neutral-600">
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
                        <h4 className="text-gray-900 dark:text-primary-100 font-semibold text-sm mb-1">{item.name}</h4>
                        <p className="text-gray-500 dark:text-primary-400 text-xs mb-1">SKU: {item.sku}</p>
                        <div className="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-primary-300">
                          {item.size && <span>Size: <strong className="dark:text-primary-100">{item.size}</strong></span>}
                          {item.color && <span>Color: <strong className="dark:text-primary-100">{item.color}</strong></span>}
                          <span>Qty: <strong className="dark:text-primary-100">{item.quantity}</strong></span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-gray-900 dark:text-primary-100 font-bold text-base">
                        UGX {(item.price * item.quantity).toLocaleString()}
                      </p>
                      <p className="text-gray-500 dark:text-primary-400 text-xs mt-1">
                        UGX {item.price.toLocaleString()} each
                      </p>
                    </div>
                  </div>
                  {index < order.items.length - 1 && (
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-600 to-transparent my-4"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 dark:bg-neutral-700 rounded-lg p-5 mb-6 border border-gray-200 dark:border-neutral-600">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-primary-300">Subtotal</span>
                <span className="text-gray-900 dark:text-primary-100 font-medium">UGX {order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-primary-300">Delivery Fee</span>
                <span className="text-gray-900 dark:text-primary-100 font-medium">
                  {order.deliveryFee === 0 ? 'Free' : `UGX ${order.deliveryFee.toLocaleString()}`}
                </span>
              </div>
              <div className="pt-3 border-t-2 border-gray-300 dark:border-neutral-500 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900 dark:text-primary-100 uppercase tracking-wide">Total</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-primary-100">
                    UGX {order.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Notes */}
          {order.notes && (
            <div className="mb-6 pb-6 border-b border-gray-200 dark:border-neutral-600">
              <h3 className="text-sm font-bold text-gray-900 dark:text-primary-100 mb-2 uppercase tracking-wide">Special Instructions</h3>
              <p className="text-gray-700 dark:text-primary-300 text-sm">{order.notes}</p>
            </div>
          )}

          {/* Payment Notice */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-700 rounded-lg p-4 text-center mb-6">
            <p className="text-amber-900 dark:text-amber-200 font-semibold text-sm mb-1">
              💳 Payment Method: Cash on Delivery
            </p>
            <p className="text-amber-700 dark:text-amber-300 text-xs">
              Expected delivery within 2-3 business days
            </p>
          </div>

          {/* Footer */}
          <div className="text-center pt-6 border-t-2 border-gray-200 dark:border-neutral-600">
            <p className="text-gray-600 dark:text-primary-300 text-xs mb-2">
              Thank you for shopping with <MysticalPiecesWord />!
            </p>
            <div className="text-gray-500 dark:text-primary-400 text-xs space-y-1">
              <p>Email: jerrylarubafestus@gmail.com</p>
              <p>Phone: +256 755 915 549</p>
              <p className="mt-2">
                © {new Date().getFullYear()} <MysticalPiecesWord /> . All rights reserved.
              </p>
            </div>
          </div>
        </motion.div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="hero-cta-buttons flex flex-col sm:flex-row gap-4 justify-center mt-12 print:hidden"
        >
          <Button
            variant="default"
            onClick={handleDownloadReceipt}
            disabled={isDownloading}
            className="inline-flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-5 h-5" />
            <span>{isDownloading ? 'Downloading...' : 'Download Receipt'}</span>
          </Button>
          <Button href="/sections/shop" variant="filled" className="inline-flex items-center justify-center space-x-2">
            <Package className="w-5 h-5" />
            <span>Continue Shopping</span>
          </Button>
          <Button href="/" variant="default" className="inline-flex items-center justify-center space-x-2">
            <Home className="w-5 h-5" />
            <span>Go Home</span>
          </Button>
        </motion.div>
      </div>

      {/* Receipt Styles */}
      <style jsx global>{`
        .receipt-container {
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        @media print {
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}

