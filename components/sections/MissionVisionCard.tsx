'use client'

import { useState, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import Button from '@/components/ui/Button'

interface MissionVisionCardProps {
  item: {
    image: string
    title: string
    description: React.ReactNode
  }
  index: number
}

export default function MissionVisionCard({ item, index }: MissionVisionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.1 * index }}
      className="text-center group"
    >
      <div className="flex-shrink-0 relative hero-glass-frame backdrop-blur-lg rounded-2xl inline-flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
        <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
        <div className="relative z-10 w-40 h-40 bg-gradient-to-br from-primary-800/30 to-primary-600/30 dark:from-primary-800/40 dark:to-primary-600/40 rounded-2xl border border-primary-500/30 dark:border-primary-500/40 overflow-hidden shadow-2xl p-8 flex items-center justify-center">
          <img 
            src={item.image} 
            alt={item.title} 
            className="w-24 h-24 object-cover rounded-xl"
          />
        </div>
      </div>
      <h4 className="text-2xl font-bold text-primary-800 dark:text-primary-100 mb-4">{item.title}</h4>
      
      <Button
        variant={isExpanded ? 'filled' : 'default'}
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="gap-2 mb-4"
      >
        <span className="font-medium">
          {isExpanded ? 'Hide Statement' : 'Show Statement'}
        </span>
        {isExpanded ? (
          <Minus className="w-4 h-4" />
        ) : (
          <Plus className="w-4 h-4" />
        )}
      </Button>
      
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ 
          opacity: isExpanded ? 1 : 0,
          height: isExpanded ? 'auto' : 0
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <p className="text-primary-600 dark:text-primary-300 text-base leading-relaxed">
          {item.description}
        </p>
      </motion.div>
    </motion.div>
  )
}


