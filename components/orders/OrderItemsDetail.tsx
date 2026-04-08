'use client'

import type { Order } from '@/lib/cart'
import SafeImage from '@/components/common/SafeImage'

export default function OrderItemsDetail({ order }: { order: Order }) {
  return (
    <div className="mt-6 pt-6 border-t border-neutral-200/60 dark:border-white/[0.08]">
      <h3 className="text-lg font-bold text-gray-900 dark:text-primary-100 mb-4 uppercase tracking-wide text-sm text-center sm:text-left">
        Items Ordered
      </h3>
      <div className="space-y-4">
        {order.items.map((item, index) => (
          <div key={`${item.sku}-${index}`}>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-4">
              <div className="flex items-start gap-3 flex-1 min-w-0 justify-center sm:justify-start">
                <div className="relative w-20 h-20 bg-gray-100/80 dark:bg-neutral-700/50 rounded-md overflow-hidden flex-shrink-0 border border-neutral-200/50 dark:border-neutral-600/50">
                  <SafeImage
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <h4 className="text-gray-900 dark:text-primary-100 font-semibold text-sm mb-1">{item.name}</h4>
                  <p className="text-gray-500 dark:text-primary-400 text-xs mb-1">SKU: {item.sku}</p>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-x-3 gap-y-1 text-xs text-gray-600 dark:text-primary-300">
                    {item.size ? (
                      <span>
                        Size: <strong className="dark:text-primary-100">{item.size}</strong>
                      </span>
                    ) : null}
                    {item.color ? (
                      <span>
                        Color: <strong className="dark:text-primary-100">{item.color}</strong>
                      </span>
                    ) : null}
                    <span>
                      Qty: <strong className="dark:text-primary-100">{item.quantity}</strong>
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-center sm:text-right flex-shrink-0">
                <p className="text-gray-900 dark:text-primary-100 font-bold text-base">
                  UGX {(item.price * item.quantity).toLocaleString()}
                </p>
                <p className="text-gray-500 dark:text-primary-400 text-xs mt-1">UGX {item.price.toLocaleString()} each</p>
              </div>
            </div>
            {index < order.items.length - 1 ? (
              <div className="w-full h-px bg-gradient-to-r from-transparent via-neutral-300/70 to-transparent dark:from-transparent dark:via-white/[0.08] dark:to-transparent my-4" />
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-neutral-200/60 dark:border-white/[0.08]">
        <div className="space-y-3">
          <div className="flex justify-between text-sm gap-4">
            <span className="text-gray-600 dark:text-primary-300">Subtotal</span>
            <span className="text-gray-900 dark:text-primary-100 font-medium tabular-nums">UGX {order.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm gap-4">
            <span className="text-gray-600 dark:text-primary-300">Delivery Fee</span>
            <span className="text-gray-900 dark:text-primary-100 font-medium">
              {order.deliveryFee === 0 ? 'Free' : `UGX ${order.deliveryFee.toLocaleString()}`}
            </span>
          </div>
          <div className="pt-3 border-t border-neutral-200/60 dark:border-white/[0.08] mt-3">
            <div className="flex justify-between items-center gap-4">
              <span className="text-lg font-bold text-gray-900 dark:text-primary-100 uppercase tracking-wide">Total</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-primary-100 tabular-nums">
                UGX {order.total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {order.notes ? (
        <div className="mt-6 pt-4 border-t border-neutral-200/60 dark:border-white/[0.08]">
          <h3 className="text-sm font-bold text-gray-900 dark:text-primary-100 mb-2 uppercase tracking-wide text-center sm:text-left">
            Special Instructions
          </h3>
          <p className="text-gray-700 dark:text-primary-300 text-sm text-center sm:text-left">{order.notes}</p>
        </div>
      ) : null}
    </div>
  )
}
