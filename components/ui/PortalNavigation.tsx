'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { HiMiniShoppingBag } from 'react-icons/hi2'
import Button from '@/components/ui/Button'

const portals = [
  {
    id: 1,
    title: "ᔕᕼOᑭ",
    image: "/assets/images/sections/portals/fashion.jpg",
    href: "/sections/shop"
  }
]

export default function PortalNavigation() {
  const router = useRouter()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitioningPortal, setTransitioningPortal] = useState<any>(null)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const portalVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6
      }
    }
  }

  const handlePortalClick = (e: React.MouseEvent, portal: any) => {
    e.preventDefault()
    setTransitioningPortal(portal)
    setIsTransitioning(true)

    const portalEffectMs = 2000
    const overlayClearMs = 3800

    window.setTimeout(() => {
      router.push(portal.href)
    }, portalEffectMs)

    window.setTimeout(() => {
      setIsTransitioning(false)
    }, overlayClearMs)
  }

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-wrap justify-center items-center gap-8 max-w-6xl mx-auto"
      >
        {portals.map((portal) => (
          <motion.div
            key={portal.id}
            variants={portalVariants}
            className="group"
          >
            <div onClick={(e) => handlePortalClick(e, portal)}>
            <div
              className="
                portal-card h-64 w-64 p-6 flex flex-col justify-center items-center
                cursor-pointer relative overflow-hidden rounded-full
                group-hover:scale-105 transition-all duration-500
                bg-cover bg-center bg-no-repeat
              "
              style={{
                backgroundImage: `url(${portal.image})`
              }}
            >
              {/* Background Overlay */}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-500" />

              {/* Main Background - No Blur */}
              <div
                className="absolute inset-0 transition-all duration-500"
                style={{
                  backgroundImage: `url(${portal.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              />

              {/* Hover Background - Blurred with Spiral Animation */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-spin-slow z-10"
                style={{
                  backgroundImage: `url(${portal.image.replace('.jpg', '-hover.jpg')})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  filter: 'blur(0.5px)'
                }}
              />

              {/* Content */}
              <div className="relative z-30 flex flex-col items-center text-center">
                <HiMiniShoppingBag className="w-14 h-14 text-white drop-shadow-lg mb-3 transition-opacity duration-300 opacity-0 group-hover:opacity-100" aria-hidden="true" />

                {/* Title */}
                <h3 className="text-3xl font-bold text-white mb-2 transition-colors duration-300 text-center drop-shadow-lg shadow-2xl group-hover:text-gray-200">
                  {portal.title}
                </h3>

                {/* Explore: primary-style button, shine on group hover */}
                <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 mb-2">
                  <Button
                    variant="default"
                    shineOnGroupHover
                    type="button"
                    className="portal-explore-btn inline-flex items-center space-x-2 group-hover:scale-105 transition-transform duration-300"
                  >
                    <span className="font-medium">Explore</span>
                    <span className="font-medium">⟹</span>
                  </Button>
                </div>
              </div>
            </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Full-screen transition: portaled to body so it is not clipped by scroll-scale transform / overflow on ancestors. */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isTransitioning && transitioningPortal && (
              <motion.div
                key="portal-transition"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[2000] flex items-center justify-center"
                style={{
                  background: `radial-gradient(circle, transparent 0%, rgba(0,0,0,0.8) 100%)`
                }}
              >
                <motion.div
                  initial={{ scale: 0.1, opacity: 0 }}
                  animate={{
                    scale: [0.1, 0.2, 0.4, 0.6, 0.8, 1, 1.2, 1.4, 1.6, 1.8, 2, 2.2, 2.4, 2.6, 2.8, 3, 3.2, 3.4, 3.6, 3.8, 4, 4.2, 4.4, 4.6, 4.8, 5],
                    opacity: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.8, 0.6, 0.4, 0.2, 0]
                  }}
                  transition={{
                    duration: 3,
                    times: [0, 0.04, 0.08, 0.12, 0.16, 0.2, 0.24, 0.28, 0.32, 0.36, 0.4, 0.44, 0.48, 0.52, 0.56, 0.6, 0.64, 0.68, 0.72, 0.76, 0.8, 0.84, 0.88, 0.92, 0.96, 1],
                    ease: "easeInOut"
                  }}
                  className="relative w-64 h-64 rounded-full overflow-hidden"
                >
                  <div
                    className="absolute inset-0 animate-spin-slow"
                    style={{
                      backgroundImage: `url(${transitioningPortal.image.replace('.jpg', '-hover.jpg')})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      filter: 'blur(1px)'
                    }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
                    <h3 className="text-3xl font-bold text-white mb-2 drop-shadow-lg shadow-2xl">
                      {transitioningPortal.title}
                    </h3>
                    <h3 className="text-lg font-bold text-white/90 mb-4 leading-tight drop-shadow-lg shadow-2xl">
                      {transitioningPortal.subtitle}
                    </h3>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  )
}
