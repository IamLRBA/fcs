'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Plus, Minus, Quote } from 'lucide-react'
import Link from 'next/link'
import Button from '@/components/ui/Button'

interface ProductSubcategory {
  name: string
  slug: string
}

interface Product { 
  id: number
  number: string
  title: string
  description: string
  image: string
  slug: string
  subcategories: ProductSubcategory[]
  quote: {
    text: string
    author: string
  }
}

const products: Product[] = [
  { 
    id: 1, 
    number: '01', 
    title: 'Shirts', 
    description: 'Discover our collection of elegant and versatile shirts, from classic button-downs to modern casual styles that complement any wardrobe.', 
    image: '/assets/images/products-sections/fashion/shirts.jpg',
    slug: 'shirts',
    subcategories: [
      { name: 'Gentle', slug: 'gentle' },
      { name: 'Checked', slug: 'checked' },
      { name: 'Textured', slug: 'textured' },
      { name: 'Denim', slug: 'denim' }
    ],
    quote: {
      text: 'A shirt that fits well is worth more than one that costs a fortune.',
      author: 'Tommy Hilfiger'
    }
  },
  { 
    id: 2, 
    number: '02', 
    title: 'Tees', 
    description: 'Comfortable and stylish t-shirts in various designs, materials, and fits perfect for everyday wear or casual outings.', 
    image: '/assets/images/products-sections/fashion/tees.jpg',
    slug: 'tees',
    subcategories: [
      { name: 'Plain', slug: 'plain' },
      { name: 'Graphic', slug: 'graphic' },
      { name: 'Collared', slug: 'collared' },
      { name: 'Sporty', slug: 'sporty' }
    ],
    quote: {
      text: 'Less is more when you\'re wearing the right t-shirt.',
      author: 'Ralph Lauren'
    }
  },
  { 
    id: 3, 
    number: '03', 
    title: 'OuterWear', 
    description: 'Stylish outerwear to keep you warm and fashionable, from classic trench coats to modern jackets for all seasons.', 
    image: '/assets/images/products-sections/fashion/outerwear.jpg',
    slug: 'coats',
    subcategories: [
      { name: 'Sweater', slug: 'sweater' },
      { name: 'Hoodie', slug: 'hoodie' },
      { name: 'Coat', slug: 'coat' },
      { name: 'Jacket', slug: 'jacket' }
    ],
    quote: {
      text: 'A coat should keep you warm, but a great coat should make you feel like you can conquer the world.',
      author: 'Coco Chanel'
    }
  },
  { 
    id: 4, 
    number: '04', 
    title: 'Bottoms', 
    description: 'Complete your look with our selection of pants and shorts, ranging from formal trousers to relaxed casual styles.', 
    image: '/assets/images/products-sections/fashion/bottoms.jpg',
    slug: 'pants-and-shorts',
    subcategories: [
      { name: 'Gentle', slug: 'gentle' },
      { name: 'Denim', slug: 'denim' },
      { name: 'Cargo', slug: 'cargo' },
      { name: 'Sporty', slug: 'sporty' }
    ],
    quote: {
      text: 'The right pair of pants can make you feel confident and ready to take on anything.',
      author: 'Karl Lagerfeld'
    }
  },
  { 
    id: 5, 
    number: '05', 
    title: 'FootWear', 
    description: 'Step out in style with our curated footwear collection including sneakers, boots, and more for every occasion.', 
    image: '/assets/images/products-sections/fashion/footwear.jpg',
    slug: 'footwear',
    subcategories: [
      { name: 'Gentle', slug: 'gentle' },
      { name: 'Sneakers', slug: 'sneakers' },
      { name: 'Sandals', slug: 'sandals' },
      { name: 'Boots', slug: 'boots' }
    ],
    quote: {
      text: 'Sneakers aren’t just utilitarian, they\'re borderline art objects.',
      author: 'Virgil Abloh'
    }
  },
  { 
    id: 6, 
    number: '06', 
    title: 'Accessories', 
    description: 'Add the perfect finishing touches with our range of accessories including bags, belts, and other essential styling elements.', 
    image: '/assets/images/products-sections/fashion/accessories.jpg',
    slug: 'accessories',
    subcategories: [
      { name: 'Rings & Necklaces', slug: 'rings-necklaces' },
      { name: 'Shades & Glasses', slug: 'shades-glasses' },
      { name: 'Bracelets & Watches', slug: 'bracelets-watches' },
      { name: 'Decor', slug: 'decor' }
    ],
    quote: {
      text: 'Accessories are like vitamins to fashion – they enhance the outfit.',
      author: 'Anna Dello Russo'
    }
  }
]

export default function FashionProducts() {
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [hoveredThumbnail, setHoveredThumbnail] = useState<{serviceId: number, thumbIndex: number} | null>(null)
  
  const toggle = (id: number) => setExpandedId(expandedId === id ? null : id)
  const getThumbnailCandidates = (slug: string, thumbIndex: number) => {
    const folderMap: Record<string, string[]> = {
      'pants-and-shorts': ['pants-and-shorts', 'bottoms', 'pants'],
    }

    const folders = folderMap[slug] || [slug]
    return folders.map(folder => `/assets/images/products-sections/fashion/${folder}/thumb${thumbIndex}.jpg`)
  }
  
  return (
    <section id="our-products" className="py-20 px-4">
      <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} viewport={{ once: true }} className="max-w-7xl mx-auto">
        <h2 className="text-5xl md:text-6xl font-bold text-center mb-16">
          <span className="text-primary-500 dark:text-primary-100">⏣ Our</span>{' '}
          <span className="text-neutral-700 dark:text-primary-300"> Products</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto px-8">
          {products.map((s, i) => { 
            const isRight = i % 2 === 1
            return (
              <motion.div key={s.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: i * 0.1 }} viewport={{ once: true }} className={`flex flex-col ${isRight ? 'items-end' : 'items-start'}`}>
                <div className={`flex flex-col space-y-6 ${isRight ? 'items-end' : 'items-start'}`}>
                  <Link href={`/products/${s.slug}`} className={`focus-ring-none flex flex-col ${isRight ? 'text-right items-end' : 'text-left items-start'} group cursor-pointer`}>
                    <div className="text-6xl font-bold text-neutral-700 dark:text-primary-400">{s.number}</div>
                    <h3 className="text-3xl font-bold mt-2 text-primary-900 dark:text-primary-50 group-hover:text-primary-600 dark:group-hover:text-primary-300 transition-colors duration-300">{s.title}</h3>
                  </Link>
                  <Link href={`/products/${s.slug}`} className={`focus-ring-none block w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] md:w-[352px] md:h-[352px] aspect-square flex-shrink-0 ${isRight ? 'ml-auto md:ml-0' : 'mr-auto md:mr-0'} group cursor-pointer hover:scale-[1.02] transition-all duration-300`}>
                    <div className="hero-glass-frame relative w-full h-full backdrop-blur-lg">
                      <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none" aria-hidden />
                    <div className="bg-gradient-to-br from-primary-800/30 to-primary-600/30 dark:from-primary-800/40 dark:to-primary-600/40 rounded-2xl border border-primary-500/30 dark:border-primary-500/40 overflow-hidden shadow-2xl w-full h-full flex items-center justify-center p-6">
                      <div className="bg-primary-900/20 rounded-xl w-full h-full aspect-square flex-shrink-0 flex items-center justify-center overflow-hidden">
                        <img src={s.image} alt={s.title} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300" onError={(e) => { const t = e.target as HTMLImageElement; t.style.display = 'none'; const f = (t.parentElement?.nextElementSibling as HTMLElement); if (f) f.style.display = 'flex' }} />
                      </div>
                    </div>
                    </div>
                  </Link>
                  <motion.div className={`flex flex-col ${isRight ? 'text-right items-end' : 'text-left items-start'}`}>
                    <p className="text-neutral-700 dark:text-primary-300 leading-relaxed mt-2 max-w-md">{s.description}</p>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button variant="default" size="sm" onClick={() => toggle(s.id)} className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 mt-4">
                        <span>{expandedId === s.id ? 'Minimize Categories' : 'Select Categories'}</span>
                        <AnimatePresence mode="wait">{expandedId === s.id ? <motion.span key="m" className="inline-flex items-center shrink-0" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}><Minus size={20} /></motion.span> : <motion.span key="p" className="inline-flex items-center shrink-0" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}><Plus size={20} /></motion.span>}</AnimatePresence>
                      </Button>
                    </motion.div>
                  </motion.div>
                </div>
                <AnimatePresence>
                  {expandedId === s.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden mt-4">
                      <div className="dark" role="presentation">
                      <div className="bg-primary-800/30 dark:bg-primary-900/40 rounded-xl p-3 sm:p-6 border border-primary-500/20 dark:border-primary-400/30">
                        {/* Thumbnail Images */}
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 justify-items-center">
                          {[1, 2, 3, 4].map((thumbIndex) => {
                            const subcategory = s.subcategories[thumbIndex - 1]
                            const isHovered = hoveredThumbnail?.serviceId === s.id && hoveredThumbnail?.thumbIndex === thumbIndex
                            
                            return (
                              <Link 
                                key={thumbIndex}
                                href={`/products/${s.slug}#${subcategory.slug}`}
                                className="focus-ring-none relative group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900"
                                onMouseEnter={() => setHoveredThumbnail({ serviceId: s.id, thumbIndex })}
                                onMouseLeave={() => setHoveredThumbnail(null)}
                              >
                                <div className="bg-primary-900/20 rounded-lg h-32 w-32 sm:h-40 sm:w-40 md:h-48 md:w-48 aspect-square flex items-center justify-center border border-primary-500/20 overflow-hidden shadow-lg transition-all duration-300 cursor-pointer group hover:border-primary-500/50 dark:hover:border-transparent hover:shadow-xl hover:ring-2 hover:ring-primary-500/20 dark:hover:ring-0 hover:bg-primary-800/10 dark:hover:bg-primary-950/30">
                                  <img 
                                    src={`/assets/images/products-sections/fashion/${s.slug}/thumb${thumbIndex}.jpg`}
                                    alt={`${subcategory.name} - ${s.title}`}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement
                                      const candidates = getThumbnailCandidates(s.slug, thumbIndex)
                                      const current = target.getAttribute('src') || ''
                                      const nextCandidate = candidates.find(candidate => candidate !== current)
                                      target.src = nextCandidate || '/assets/images/placeholder.jpg'
                                    }}
                                  />
                                  <div className="absolute inset-x-0 bottom-0 md:hidden flex items-center justify-center overflow-hidden rounded-tl-lg rounded-tr-lg rounded-bl-none rounded-br-none border-x border-b border-primary-500/20 dark:border-transparent bg-white/50 px-3 pt-2 pb-1.5 text-center backdrop-blur-sm dark:bg-neutral-950/75 translate-y-[1px]">
                                    <span className="text-xs font-medium text-primary-800 dark:text-neutral-100">
                                      {subcategory.name}
                                    </span>
                                  </div>
                                </div>
                                
                                {/* Hover Overlay */}
                                <AnimatePresence>
                                  {isHovered && (
                                    <motion.div
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      exit={{ opacity: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="absolute inset-0 hidden md:flex bg-black/60 flex-col items-center justify-center space-y-3 rounded-lg"
                                    >
                                      <motion.span
                                        initial={{ y: 10, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.1 }}
                                        className="text-neutral-850 dark:text-white font-bold text-xs sm:text-base md:text-lg"
                                      >
                                        {subcategory.name}
                                      </motion.span>
                                      <motion.div
                                        initial={{ y: 10, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.15 }}
                                        className="btn-unified inline-flex items-center justify-center text-center px-3 py-1 md:px-6 md:py-2 text-xs md:text-sm font-medium pointer-events-none"
                                      >
                                        View Collection
                                      </motion.div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </Link>
                            )
                          })}
                        </div>
                      </div>
                      </div>
                        
                        {/* Quote Section - outside dark wrapper so light mode uses text-neutral-500 */}
                        <div className="mt-2 pt-2 pb-2 px-3 sm:pt-4 sm:px-6 sm:pb-6 border-t border-primary-500/20 bg-primary-800/30 dark:bg-primary-900/40 rounded-b-xl border-x border-b border-primary-500/20 dark:border-primary-400/30">
                          <blockquote className="text-center max-w-full sm:max-w-md md:max-w-lg mx-auto">
                            <Quote className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 sm:mb-4 text-primary-700 dark:text-primary-400/50" />
                            <p className="text-primary-700 dark:text-primary-400 italic text-sm sm:text-lg md:text-xl mb-2 sm:mb-3">
                              {s.quote.text}
                            </p>
                            <span 
                              className="text-primary-700 dark:text-primary-300 text-xs sm:text-sm font-medium inline-block"
                            >
                              — {s.quote.author}
                            </span>
                          </blockquote>
                        </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </section>
  )
}


