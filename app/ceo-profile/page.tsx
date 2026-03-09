'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { IconBrandWhatsapp, IconBrandTiktok, IconBrandSnapchat, IconBrandX } from '@tabler/icons-react'
import { SOCIAL_LINKS } from '@/lib/constants/social'
import { 
  Mail, 
  Instagram, 
  Github, 
  MapPin, 
  Phone, 
  X,
  Maximize2,
  Send,
  Building2,
  Music,
  Palette,
  Code,
  Shirt,
  MessageCircle,
  Twitter,
  Youtube
} from 'lucide-react'
import Link from 'next/link'
import EducationalJourney from '@/components/sections/EducationalJourney'
import Button from '@/components/ui/Button'
import ModalCloseButton from '@/components/ui/ModalCloseButton'

export default function CEOProfile() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const galleryThumbnailRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  const skills = [
    {
      category: '⾕ ᗩᖇᑕᕼITEᑕTᑌᖇE',
      description: 'Composes living structures in ArchiCAD and Lumion that focus on merging sustainability and beauty with poised modern forms washed in earth tones.',
      details: 'Entered architecture school in 2021 and kept learning through night-long tutorials and experiments, crafting “out of this world” concepts that still lean into their landscapes.'
    },
    {
      category: 'ᗰᑌֆIᑕ ᗩᑎᗪ ᑭOETᖇY 𝄞',
      description: 'Shapes harmonies with an acapella-trained voice and pens verses where each lyric loops back to purpose, rap cadence, and story.',
      details: 'Since 2015 the pen has been guided by J. Cole, Kendrick, Eminem, and UK minds like Santan Dave, Aitch, and Skepta—melding melodic rap and emo trap textures into layered narratives.'
    },
    {
      category: '☯ ᗩᖇT ᗩᑎᗪ ᗪEᔕIGᑎ',
      description: 'A Fine-Art foundation nurtured since childhood now flows through digital canvases, sculpture, bespoke furniture, and décor concepts.',
      details: 'Trains an instinctive spatial awareness and a “Jerry-rig” discipline—seeing new angles, improvising with whatever is at hand, and bending materials into poetic form.'
    },
    {
      category: 'ᔕOᖴTᗯᗩᖇE ᗪEᐯEᒪOᑭᗰEᑎT ⚛',
      description: 'Since September, 2024, code became another atelier. Self-taught in HTML, CSS, JavaScript, Java, React, and allied frameworks.',
      details: 'Focus stays on expressive front-end work, thoughtful UI/UX, and select back-end explorations, building personal products that feel crafted, not just coded.'
    },
    {
      category: '✃ ᖴᗩᔕᕼIOᑎ',
      description: 'Treats dressing as a gallery—curating silhouettes by mood, obsessing over proportion, and finishing every look with deliberate accessories.',
      details: 'Moves fluidly from gentle classics to retro vintage, modern tailoring, sports, and streetwear, often editing or inventing garments to match the moment.'
    }
  ]



  const socialLinks = SOCIAL_LINKS

  const galleryImages = [
    '/assets/images/ceo-1.jpg',
    '/assets/images/ceo-2.jpg',
    '/assets/images/ceo-3.jpg',
    '/assets/images/ceo-4.jpg',
    '/assets/images/ceo-5.jpg'
  ]

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)
  }


  const openImageModal = (index: number) => {
    setSelectedImage(index)
  }

  const closeImageModal = () => {
    setSelectedImage(null)
  }

  const scrollGalleryThumbnails = (direction: 'left' | 'right') => {
    if (galleryThumbnailRef.current) {
      galleryThumbnailRef.current.scrollBy({
        left: direction === 'left' ? -180 : 180,
        behavior: 'smooth'
      })
    }
  }

  // Scroll-based animations
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])

  const [expandedSkills, setExpandedSkills] = useState<{ [key: string]: boolean }>({})
  const [showBackButton, setShowBackButton] = useState(true)

  const toggleSkill = (category: string) => {
    setExpandedSkills(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

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
    <div ref={containerRef} className="min-h-screen bg-unified relative overflow-hidden">
      {/* Navigation Back */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: showBackButton ? 1 : 0, x: showBackButton ? 0 : -120 }}
        transition={{ duration: 0.3 }}
        className="fixed top-20 left-4 sm:left-8 z-50 pointer-events-none"
        style={{ pointerEvents: showBackButton ? 'auto' : 'none' }}
      >
        <Link href="/about-us" className="focus-ring-none inline-flex items-center gap-2 text-primary-600 dark:text-primary-300 hover:text-primary-800 dark:hover:text-primary-100 transition-colors duration-300">
          <span className="btn-unified-circle flex-shrink-0">⟸</span>
          <span className="text-sm font-medium">Back to About Us</span>
        </Link>
      </motion.div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-32 md:pt-40">
        <motion.div
          style={{ y, opacity, scale }}
          className="text-center z-20 px-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="mb-8"
          >
            <div className="w-48 h-48 mx-auto mb-8 relative overflow-hidden rounded-full border-8 border-white shadow-2xl">
              <img
                src="/assets/images/ceo-profile.jpg"
                alt="LRBA - CEO"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-8xl md:text-8xl font-bold mb-6">
              <span className="text-primary-800">ᒪᖇᗷᗩ</span>
            </h1>
            <p className="text-2xl md:text-3xl text-primary-700 mb-6 max-w-4xl mx-auto leading-relaxed">
            ᑕEO & ᖴOᑌᑎᗪEᖇ
            </p>
            <p className="text-lg text-primary-600 max-w-3xl mx-auto">
              A visionary creative leader who materializes ideas through structural ingenuity across multiple dimensions of human expression.
            </p>
          </motion.div>
        </motion.div>

        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-20 left-20 w-32 h-32 border border-primary-500/20 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-20 right-20 w-24 h-24 border border-accent-500/20 rounded-full"
            style={{ animationDelay: '1s' }}
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-10 w-16 h-16 border border-primary-400/30 rounded-full"
            style={{ animationDelay: '2s' }}
          />
        </div>
      </section>

      {/* Skills Section - Our Missions Style */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-center mb-16">
            <span className="text-primary-800">ᑕᖇEᗩTIᐯE</span> <span className="text-accent-600">ᔕKIᒪᒪᔕ</span>
          </h2>
          
          <div className="space-y-16 flex flex-col items-center">
            {skills.map((skill, index) => (
              <motion.div
                key={skill.category}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="w-full max-w-4xl"
              >
                                                   <div className={`flex flex-col space-y-8 ${
                    index % 2 === 0 
                      ? 'items-start' // Left aligned (staggered)
                      : 'items-end' // Right aligned (staggered)
                  }`}>
                                       {/* Image Container */}
                    <div className={`flex-shrink-0 bg-gradient-to-br from-primary-800/30 to-primary-600/30 rounded-2xl border border-primary-500/30 overflow-hidden shadow-2xl p-8 ${index % 2 === 0 ? 'self-start' : 'self-end'}`}>
                      {skill.category === '⾕ ᗩᖇᑕᕼITEᑕTᑌᖇE' && (
                        <img 
                          src="/assets/images/sections/ceo/architecture.jpg" 
                          alt="Architecture" 
                          className="w-24 h-24 object-cover rounded-xl"
                        />
                      )}
                      {skill.category === 'ᗰᑌֆIᑕ ᗩᑎᗪ ᑭOETᖇY 𝄞' && (
                        <img 
                          src="/assets/images/sections/ceo/music.jpg" 
                          alt="Music and Poetry" 
                          className="w-24 h-24 object-cover rounded-xl"
                        />
                      )}
                      {skill.category === '☯ ᗩᖇT ᗩᑎᗪ ᗪEᔕIGᑎ' && (
                        <img 
                          src="/assets/images/sections/ceo/art.jpg" 
                          alt="Art and Design" 
                          className="w-24 h-24 object-cover rounded-xl"
                        />
                      )}
                      {skill.category === 'ᔕOᖴTᗯᗩᖇE ᗪEᐯEᒪOᑭᗰEᑎT ⚛' && (
                        <img 
                          src="/assets/images/sections/ceo/coding.jpg" 
                          alt="Software Development" 
                          className="w-24 h-24 object-cover rounded-xl"
                        />
                      )}
                      {skill.category === '✃ ᖴᗩᔕᕼIOᑎ' && (
                        <img 
                          src="/assets/images/sections/ceo/fashion.jpg" 
                          alt="Fashion" 
                          className="w-24 h-24 object-cover rounded-xl"
                        />
                      )}
                    </div>
                   
                                       {/* Content */}
                    <div className={`flex flex-col flex-1 ${
                      index % 2 === 0 
                        ? 'text-left' // Left aligned - both mobile and desktop
                        : 'text-right' // Right aligned - both mobile and desktop
                    }`}>
                      <div className="text-6xl font-bold text-primary-400 mb-4">0{index + 1}</div>
                      <h3 className="text-3xl font-bold text-primary-800 mb-2">{skill.category}</h3>
                      <p className={`text-primary-600 text-lg mb-4 ${
                        index % 2 === 0 
                          ? 'max-w-md' // Left aligned - keep max width
                          : 'max-w-md ml-auto' // Right aligned - push to right (both mobile and desktop)
                      }`}>
                        {skill.description}
                      </p>
                      
                      {/* Expandable Details */}
                      <div className={`border-t border-primary-200/50 pt-4 ${
                        index % 2 === 0 
                          ? 'text-left' // Left aligned - both mobile and desktop
                          : 'text-right' // Right aligned - both mobile and desktop
                      }`}>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => toggleSkill(skill.category)}
                          className={`gap-2 ${index % 2 === 0 ? 'justify-start' : 'justify-end ml-auto'}`}
                        >
                         <span>
                           {expandedSkills[skill.category] ? 'Read Less' : 'Read More'}
                         </span>
                         <div className="w-5 h-5 flex items-center justify-center">
                           {expandedSkills[skill.category] ? (
                             <motion.div
                               initial={{ rotate: 0 }}
                               animate={{ rotate: 45 }}
                               transition={{ duration: 0.3 }}
                               className="text-lg font-bold leading-none"
                             >
                               −
                             </motion.div>
                           ) : (
                             <motion.div
                               initial={{ rotate: 0 }}
                               animate={{ rotate: 0 }}
                               transition={{ duration: 0.3 }}
                               className="text-lg font-bold leading-none"
                             >
                               +
                             </motion.div>
                           )}
                         </div>
                       </Button>
                       
                       {/* Expandable Content */}
                       <AnimatePresence>
                         {expandedSkills[skill.category] && (
                                                       <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-4 pt-4 border-t border-primary-200/30">
                                                                 <p className={`text-primary-500 text-base leading-relaxed ${
                                   index % 2 === 0 
                                     ? 'text-left' // Left aligned - both mobile and desktop
                                     : 'text-right' // Right aligned - both mobile and desktop
                                 }`}>
                                  {skill.details}
                                </p>
                              </div>
                            </motion.div>
                         )}
                       </AnimatePresence>
                     </div>
                   </div>
                 </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Educational Journey Section */}
      <EducationalJourney />

      {/* Gallery Section */}
      <section className="py-36 px-4 mt-12">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-center mb-32">
            <span className="text-primary-800">ᑭᕼOTO</span> <span className="text-accent-600">GᗩᒪᒪEᖇY</span>
          </h2>
          
          <div className="relative flex flex-col items-center">
            <style jsx>{`
              .gallery-thumbnail-row::-webkit-scrollbar {
                height: 4px;
                border-radius: 9999px;
              }
              .gallery-thumbnail-row::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.3);
                border-radius: 9999px;
              }
              .gallery-thumbnail-row::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 9999px;
              }
            `}</style>
            {/* Main Image */}
            <div className="relative mb-8 group p-1 rounded-2xl border border-white/60 dark:border-white/30" style={{ borderWidth: '1px' }}>
              <img
                src={galleryImages[currentImageIndex]}
                alt={`CEO Image ${currentImageIndex + 1}`}
                className="max-w-full max-h-[600px] w-auto h-auto object-contain transition-transform duration-500 hover:scale-105 cursor-pointer rounded-xl shadow-2xl hover:shadow-3xl"
                onClick={() => openImageModal(currentImageIndex)}
              />
              
              {/* Fullscreen Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openImageModal(currentImageIndex)}
                className="absolute top-4 right-4 p-2 text-white/80 hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-200"
                aria-label="Expand photo"
              >
                <Maximize2 className="w-6 h-6" />
              </motion.button>
            </div>
            
            {/* Navigation Arrows */}
            <Button variant="default" size="icon" onClick={prevImage} className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 shadow-lg hover:shadow-xl flex items-center justify-center">
              <span className="text-2xl">⟸</span>
            </Button>
            <Button variant="default" size="icon" onClick={nextImage} className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 shadow-lg hover:shadow-xl flex items-center justify-center">
              <span className="text-2xl">⟹</span>
            </Button>

            {/* Thumbnails */}
            {galleryImages.length > 1 && (
              <div className="relative w-full max-w-3xl mt-6">
                {galleryImages.length > 4 && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => scrollGalleryThumbnails('left')}
                      className="p-1 text-primary-100 hover:text-white transition-colors duration-200"
                      aria-label="Scroll thumbnails left"
                    >
                      <span className="text-xl">⟸</span>
                    </motion.button>
                  </div>
                )}
                <div
                  ref={galleryThumbnailRef}
                  className="gallery-thumbnail-row flex items-center justify-center gap-2 md:gap-3 overflow-x-auto scroll-smooth py-3 px-4"
                  style={{ scrollbarWidth: 'thin' }}
                >
                  {galleryImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 h-16 w-16 md:h-20 md:w-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                        currentImageIndex === index ? 'border-primary-400 scale-105' : 'border-transparent hover:border-primary-300'
                      }`}
                      aria-label={`View photo ${index + 1}`}
                    >
                      <img src={img} alt={`CEO Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                {galleryImages.length > 4 && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => scrollGalleryThumbnails('right')}
                      className="p-1 text-primary-100 hover:text-white transition-colors duration-200"
                      aria-label="Scroll thumbnails right"
                    >
                      <span className="text-xl">⟹</span>
                    </motion.button>
                  </div>
                )}
              </div>
            )}
            
            {/* Dots Indicator */}
            <div className="flex justify-center space-x-3">
              {galleryImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentImageIndex ? 'bg-primary-600 scale-125' : 'bg-neutral-300 hover:bg-neutral-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Social Media Section - Icons only, no words */}
      <section className="mb-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="max-w-4xl mx-auto"
        >
          <h3 className="text-3xl font-bold text-primary-900 mb-8 text-center">ᑕOᑎᑎEᑕT ᗯITᕼ ᗰE</h3>
          <div className="flex justify-center flex-wrap gap-6">
            {socialLinks.map((social, index) => (
              <motion.a
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 1.2 + index * 0.1 }}
                whileHover={{ scale: 1.2, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="w-16 h-16 flex items-center justify-center transition-all duration-300 group"
              >
                <social.icon className="w-8 h-8 text-primary-600 group-hover:text-primary-800 transition-colors duration-300" />
              </motion.a>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Contact Section */}
      <section className="mb-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="max-w-6xl mx-auto"
        >
          <h3 className="text-3xl font-bold text-primary-900 mb-8 text-center">GET Iᑎ TOᑌᑕᕼ</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-primary-800/30 to-primary-600/30 dark:from-primary-800/40 dark:to-primary-600/40 border border-primary-500/30 dark:border-primary-500/40 overflow-hidden shadow-2xl backdrop-blur-sm">
              <Mail className="w-8 h-8 text-primary-600 mx-auto mb-3" />
              <h4 className="font-semibold text-primary-900 dark:text-primary-100 mb-2">EᗰᗩIᒪ</h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-3">jerrylarubafestus@gmail.com</p>
              <Button href="mailto:jerrylarubafestus@gmail.com" variant="default" className="inline-flex items-center justify-center px-6">
                Email Me
              </Button>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-primary-800/30 to-primary-600/30 dark:from-primary-800/40 dark:to-primary-600/40 border border-primary-500/30 dark:border-primary-500/40 overflow-hidden shadow-2xl backdrop-blur-sm">
              <Phone className="w-8 h-8 text-primary-600 mx-auto mb-3" />
              <h4 className="font-semibold text-primary-900 dark:text-primary-100 mb-2">ᑭᕼOᑎE</h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-3">+256774948086</p>
              <Button href="tel:+256774948086" variant="default" className="inline-flex items-center justify-center px-6">
                Call Me
              </Button>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-primary-800/30 to-primary-600/30 dark:from-primary-800/40 dark:to-primary-600/40 border border-primary-500/30 dark:border-primary-500/40 overflow-hidden shadow-2xl backdrop-blur-sm">
              <IconBrandWhatsapp className="w-8 h-8 text-primary-600 mx-auto mb-3" />
              <h4 className="font-semibold text-primary-900 dark:text-primary-100 mb-2">ᗯᕼᗩTᔕᗩᑭᑭ</h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-3">+256755915549</p>
              <Button href="https://wa.me/256755915549" variant="default" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-6">
                Message Me
              </Button>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-primary-800/30 to-primary-600/30 dark:from-primary-800/40 dark:to-primary-600/40 border border-primary-500/30 dark:border-primary-500/40 overflow-hidden shadow-2xl backdrop-blur-sm">
              <MapPin className="w-8 h-8 text-primary-600 mx-auto mb-3" />
              <h4 className="font-semibold text-primary-900 dark:text-primary-100 mb-2">ᒪOᑕᗩTIOᑎ</h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-3">Kampala, Uganda</p>
              <Button href="https://maps.google.com/?q=Kampala,Uganda" variant="default" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-6">
                Find Me
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeImageModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative flex items-center justify-center w-full h-full p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <ModalCloseButton onClose={closeImageModal} className="absolute top-6 right-6 z-10 flex-shrink-0" aria-label="Close photo" />
              
              <img
                src={galleryImages[selectedImage]}
                alt={`CEO Image ${selectedImage + 1}`}
                className="max-w-full max-h-full w-auto h-auto object-contain rounded-2xl shadow-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
