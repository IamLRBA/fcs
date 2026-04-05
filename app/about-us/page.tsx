'use client'

import AboutUs from '@/components/sections/AboutUs'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'

export default function AboutUsPage() {
  return (
    <>
      <AboutUs />
      
      {/* CTA Section */}
      <section className="section bg-unified py-20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-primary-800 dark:text-primary-100 mb-6">
              E᙭ᑭᒪOᖇE <span className="text-accent-600 dark:text-accent-400">the Portal</span>
            </h2>
            <p className="text-xl text-primary-700 dark:text-primary-300 max-w-3xl mx-auto mb-8">
              Dive into our portal and feel future-forward thrift fashion in motion.
            </p>
            <div className="hero-cta-buttons flex justify-center">
              <Button
                href="/sections/shop"
                variant="default"
                size="md"
                className="inline-flex items-center justify-center space-x-2 group"
              >
                <span>view the ᔕᕼOᑭ portal</span>
                <span className="transform group-hover:translate-x-1 transition-transform duration-300 text-2xl leading-none">⟹</span>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}

