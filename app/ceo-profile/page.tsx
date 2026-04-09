'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { IconBrandWhatsapp, IconBrandTiktok, IconBrandSnapchat, IconBrandX } from '@tabler/icons-react'
import { CEO_EMAIL } from '@/lib/constants/brand-contact'
import { 
  Mail, 
  Instagram, 
  Github, 
  MapPin, 
  Phone, 
  X,
  Maximize2,
  Copy,
  Check,
  Send,
  Building2,
  Music,
  Palette,
  Code,
  Shirt,
  MessageCircle,
  Twitter
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import EducationalJourney from '@/components/sections/EducationalJourney'
import Button from '@/components/ui/Button'
import ModalCloseButton from '@/components/ui/ModalCloseButton'
import HorizontalScrollAffordance from '@/components/ui/HorizontalScrollAffordance'
import { SLIDER_SYNC_EDGE_LINE_CLASS } from '@/lib/constants/slider-edge'

export default function CEOProfile() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  const skills = [
    {
      category: '⾕ ᗩᖇᑕᕼITEᑕTᑌᖇE',
      description:
        'He works mainly in ArchiCAD and Lumion, and what you notice in his schemes is that he never treats a building as a box on a plot. He likes ideas that feel grounded-warm, earthy palettes, clean modern lines—and he still wants the place to sit naturally in its setting.',
      details:
        'He started architecture school in 2021 and never really switched off after class. Nights went to tutorials, small experiments, and sketches that looked a bit wild on paper but always came back to something you could imagine walking through. He is still learning in public, in the best sense.',
    },
    {
      category: 'ᗰᑌֆIᑕ ᗩᑎᗪ ᑭOETᖇY 𝄞',
      description:
        'He is rained in an acapella group so, he cares about tones and songs the way some people care about colour (he does to but anyway...). His writing is mostly rap and spoken-word shaped: story first, then rhythm, then the line that stays with you after the track ends.',
      details:
        'He has been writing seriously since around 2015. You will hear the influence of artists he grew up on; think Cole, Kendrick, Eminem and a lot of UK voices too, Dave, Aitch, Skepta. He is not copying any of them; he is building his own lane from what they taught him about honesty and craft.',
    },
    {
      category: '☯ ᗩᖇT ᗩᑎᗪ ᗪEᔕIGᑎ',
      description:
        'Art was never a side hobby for him, it was there from childhood. Now it shows up everywhere: on a screen, in clay or wood, in a piece of furniture he sketched because nothing in a shop felt quite right.',
      details:
        'He has a knack for seeing space before it exists, and he is not precious about materials. If something needs to be fixed or mocked up with what is in the room, he will do it. That mix of instinct and “Jerry-Rig” mentality shows up in almost everything he makes.',
    },
    {
      category: 'ᔕOᖴTᗯᗩᖇE ᗪEᐯEᒪOᑭᗰEᑎT ⚛',
      description:
        'Coding entered his life properly in September 2024. He picked up HTML, CSS, JavaScript, Java, React, and the usual surrounding tools the way he picks up anything else by building, breaking, and trying again.',
      details:
        'He leans toward front end and the parts of a product people actually touch: layout, motion, clarity. He will dip into back end when a feature needs it, but the goal is always something that feels finished, not something that only looks fine in a screenshot. He is not just a designer, he is a developer.',
    },
    {
      category: '✃ ᖴᗩᔕᕼIOᑎ',
      description:
        'For him, getting dressed is closer to hanging a show than to following rules. He thinks in silhouette and balance, and he will add or remove an accessory until the whole look says what he meant it to say. He is not just a fashion designer, he is a fashion artist.',
      details:
        'His wardrobe moves around a lot - quiet classics one day, vintage or street the next, because his mood moves too. He alters pieces or puts something together himself when nothing off the rack quite matches the day. It is personal curation, not performance.',
    },
  ]



  const galleryImages = [
    '/assets/images/ceo-1.jpg',
    '/assets/images/ceo-2.jpg',
    '/assets/images/ceo-3.jpg',
    '/assets/images/ceo-4.jpg',
    '/assets/images/ceo-5.jpg',
    '/assets/images/ceo-6.jpg',
    '/assets/images/ceo-7.jpg',
    '/assets/images/ceo-8.jpg',
    '/assets/images/ceo-9.jpg'
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

  // Scroll-based animations
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])

  const [expandedSkills, setExpandedSkills] = useState<{ [key: string]: boolean }>({})
  const [showBackButton, setShowBackButton] = useState(true)
  const [phoneDialogOpen, setPhoneDialogOpen] = useState(false)
  const [copiedTel, setCopiedTel] = useState<string | null>(null)

  const CALL_NUMBERS = [
    { label: '+256 774 948 086', tel: '+256774948086' },
    { label: '+256 755 915 549', tel: '+256755915549' },
  ] as const

  const copyNumber = async (tel: string) => {
    try {
      await navigator.clipboard.writeText(tel)
      setCopiedTel(tel)
      window.setTimeout(() => setCopiedTel(null), 2000)
    } catch {
      /* ignore */
    }
  }

  const CEO_SOCIAL_LINKS = [
    { name: 'Email', icon: Mail, href: `mailto:${CEO_EMAIL}` },
    { name: 'Instagram', icon: Instagram, href: 'https://www.instagram.com/iamlrba?igsh=MXcwcTF3b3R6ZG9yeQ%3D%3D&utm_source=qr' },
    { name: 'TikTok', icon: IconBrandTiktok, href: 'https://www.tiktok.com/@iamlrba?_t=ZM-8yRqigzltXK&_r=1' },
    { name: 'X (Twitter)', icon: IconBrandX, href: 'https://x.com/iamlrba?s=11' },
    { name: 'WhatsApp', icon: IconBrandWhatsapp, href: 'https://wa.me/256755915549' },
    { name: 'GitHub', icon: Github, href: 'https://github.com/IamLRBA' },
  ] as const

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

      {/* Hero Section — extra top padding so avatar sits lower from fixed Back link */}
      <section className="relative min-h-screen flex items-center justify-center pt-44 md:pt-52 pb-16">
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
            <div className="hero-glass-frame relative inline-block backdrop-blur-lg rounded-full mx-auto mb-8">
              <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-full" aria-hidden />
              <div className="relative p-2 sm:p-3 rounded-full">
                <div className="w-44 h-44 sm:w-48 sm:h-48 relative overflow-hidden rounded-full border-4 border-primary-200/60 dark:border-primary-700/50 shadow-2xl">
                  <Image
                    src="/assets/images/ceo-profile.jpg"
                    alt="LRBA - CEO"
                    width={192}
                    height={192}
                    priority
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
            <h1 className="text-8xl md:text-8xl font-bold mb-6">
              <span className="text-primary-800 dark:text-primary-100">ᒪᖇᗷᗩ</span>
            </h1>
            <p className="text-2xl md:text-3xl text-primary-700 dark:text-primary-300 mb-6 max-w-4xl mx-auto leading-relaxed">
            ᑕEO & ᖴOᑌᑎᗪEᖇ
            </p>
            <p className="text-lg text-primary-600 dark:text-primary-400 max-w-3xl mx-auto">
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
            <span className="text-primary-800 dark:text-primary-200">ᑕᖇEᗩTIᐯE</span>{' '}
            <span className="text-accent-600 dark:text-accent-400">ᔕKIᒪᒪᔕ</span>
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
                    <div className={`hero-glass-frame relative flex-shrink-0 rounded-2xl overflow-hidden backdrop-blur-lg ${index % 2 === 0 ? 'self-start' : 'self-end'}`}>
                      <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-2xl" aria-hidden />
                      <div className="relative bg-gradient-to-br from-primary-800/25 to-primary-600/25 dark:from-primary-800/35 dark:to-primary-600/35 rounded-2xl border border-primary-500/25 dark:border-primary-500/40 overflow-hidden shadow-2xl p-6 md:p-8">
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

      {/* Gallery Section — tighter gap below Educational Journey */}
      <section className="pt-10 md:pt-14 pb-36 px-4 mt-6 md:mt-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-center mb-16 md:mb-24 mt-0 md:mt-2">
            <span className="text-primary-800 dark:text-primary-200">ᑭᕼOTO</span>{' '}
            <span className="text-accent-600 dark:text-accent-400">GᗩᒪᒪEᖇY</span>
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
            {/* Main Image — one layout all breakpoints: glass shrink-wraps to image; max-w-full keeps narrow/tablet/desktop consistent */}
            <div className="relative mb-8 w-full max-w-5xl mx-auto">
              <Button type="button" variant="default" size="icon" onClick={prevImage} className="absolute left-0 sm:left-1 md:left-2 top-1/2 -translate-y-1/2 w-12 h-12 shadow-lg hover:shadow-xl flex items-center justify-center focus-ring-none z-10">
                <span className="text-2xl">⟸</span>
              </Button>
              <Button type="button" variant="default" size="icon" onClick={nextImage} className="absolute right-0 sm:right-1 md:right-2 top-1/2 -translate-y-1/2 w-12 h-12 shadow-lg hover:shadow-xl flex items-center justify-center focus-ring-none z-10">
                <span className="text-2xl">⟹</span>
              </Button>
              <div className="flex w-full justify-center px-2 sm:px-8 md:px-12 lg:px-16">
                <div className="hero-glass-frame relative group rounded-2xl backdrop-blur-lg w-fit max-w-[calc(100vw-2rem)] sm:max-w-full min-w-0 overflow-hidden">
                  <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-2xl" aria-hidden />
                  <div className="relative p-2 sm:p-3 rounded-2xl border border-primary-200/40 dark:border-primary-700/40 flex items-center justify-center">
                    <img
                      src={galleryImages[currentImageIndex]}
                      alt={`CEO Image ${currentImageIndex + 1}`}
                      className="max-h-[560px] w-auto h-auto object-contain block transition-transform duration-500 hover:scale-[1.02] cursor-pointer rounded-xl shadow-2xl hover:shadow-3xl max-w-[min(calc(100vw-4.5rem),56rem)] sm:max-w-[min(calc(100vw-6rem),56rem)] md:max-w-[min(calc(100vw-8rem),56rem)]"
                      onClick={() => openImageModal(currentImageIndex)}
                    />
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openImageModal(currentImageIndex)}
                      className="absolute top-3 right-3 p-2 text-primary-700 dark:text-primary-200 hover:text-primary-900 dark:hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-200 focus-ring-none rounded-lg"
                      aria-label="Expand photo"
                    >
                      <Maximize2 className="w-6 h-6" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>

            {/* Thumbnails — match quick-view style with side vertical rails */}
            {galleryImages.length > 1 && (
              <HorizontalScrollAffordance
                showEdgeFades={false}
                syncScrollEdgeLines
                syncScrollEdgeLineClassName={SLIDER_SYNC_EDGE_LINE_CLASS}
                hideScrollbar
                className="mx-auto mt-6 w-full max-w-[26rem] px-1 sm:max-w-[30rem]"
                scrollClassName="py-3"
                scrollAriaLabel="CEO gallery thumbnails"
              >
                <div className="flex min-h-[1px] min-w-full w-max flex-row items-center justify-center gap-2 px-1 md:gap-3">
                  {galleryImages.map((img, index) => {
                    const isActive = currentImageIndex === index
                    return (
                      <button
                        key={index}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setCurrentImageIndex(index)}
                        aria-current={isActive ? 'true' : undefined}
                        className={`focus-ring-none relative aspect-square w-14 flex-shrink-0 overflow-hidden rounded-xl border bg-neutral-100 transition-all duration-200 sm:w-16 md:w-[4.75rem] dark:bg-neutral-800/40 ${
                          isActive
                            ? 'z-[1] border-2 border-primary-600 shadow-md dark:border-primary-400'
                            : 'border-neutral-300/90 hover:border-primary-400/70 dark:border-neutral-600 dark:hover:border-primary-500/60'
                        }`}
                      >
                        <span className="absolute inset-0 overflow-hidden rounded-[inherit] bg-neutral-50 dark:bg-neutral-900/50">
                          <img src={img} alt={`CEO Thumbnail ${index + 1}`} className="w-full h-full object-cover object-center" />
                        </span>
                      </button>
                    )
                  })}
                </div>
              </HorizontalScrollAffordance>
            )}
          </div>
        </motion.div>
      </section>

      {/* Social — same pattern as Footer (social-links + Button circle) */}
      <section className="mb-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="max-w-4xl mx-auto"
        >
          <h3 className="text-3xl font-bold text-primary-900 dark:text-primary-100 mb-8 text-center">ᑕOᑎᑎEᑕT ᗯITᕼ ᗰE</h3>
          <div className="social-links flex justify-center flex-wrap gap-6 mb-8">
            {CEO_SOCIAL_LINKS.map((social) => {
              const Icon = social.icon as any
              return (
                <motion.div key={social.name} className="social-link" whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
                  <Button variant="circle" href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.name} className="focus-ring-none">
                    <Icon size={24} />
                  </Button>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </section>

      {/* Contact Section — same card design & grid as Home Contact.tsx */}
      <section className="section relative overflow-hidden mb-16">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="section-title"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-primary-800 dark:text-primary-100 mb-6 text-center">
              GET Iᑎ <span className="text-accent-600 dark:text-accent-300">TOᑌᑕᕼ</span>
            </h2>
            <p className="text-xl text-primary-700 dark:text-primary-300 max-w-3xl mx-auto text-center">
              Any questions about me? Contact me and I'm here to help you find answers.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0 }}
              className="group"
            >
              <div className="hero-glass-frame relative h-full backdrop-blur-lg">
                <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none" aria-hidden />
                <div className="text-center p-6 rounded-xl bg-gradient-to-br from-primary-800/30 to-primary-600/30 dark:from-primary-800/40 dark:to-primary-600/40 border border-primary-500/30 dark:border-primary-500/40 overflow-hidden shadow-2xl backdrop-blur-sm h-full">
                  <Mail className="w-8 h-8 text-primary-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-primary-900 dark:text-primary-100 mb-2">EᗰᗩIᒪ</h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-3">{CEO_EMAIL}</p>
                  <Button href={`mailto:${CEO_EMAIL}`} variant="default" className="inline-flex items-center justify-center px-6">
                    Email Me
                  </Button>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="group"
            >
              <div className="hero-glass-frame relative h-full backdrop-blur-lg">
                <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none" aria-hidden />
                <div className="text-center p-6 rounded-xl bg-gradient-to-br from-primary-800/30 to-primary-600/30 dark:from-primary-800/40 dark:to-primary-600/40 border border-primary-500/30 dark:border-primary-500/40 overflow-hidden shadow-2xl backdrop-blur-sm h-full">
                  <Phone className="w-8 h-8 text-primary-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-primary-900 dark:text-primary-100 mb-2">ᑭᕼOᑎE</h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-3">Click to Call</p>
                  <Button onClick={() => setPhoneDialogOpen(true)} variant="default" className="inline-flex items-center justify-center px-6">
                    Call Me
                  </Button>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="group"
            >
              <div className="hero-glass-frame relative h-full backdrop-blur-lg">
                <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none" aria-hidden />
                <div className="text-center p-6 rounded-xl bg-gradient-to-br from-primary-800/30 to-primary-600/30 dark:from-primary-800/40 dark:to-primary-600/40 border border-primary-500/30 dark:border-primary-500/40 overflow-hidden shadow-2xl backdrop-blur-sm h-full">
                  <IconBrandWhatsapp className="w-8 h-8 text-primary-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-primary-900 dark:text-primary-100 mb-2">ᗯᕼᗩTᔕᗩᑭᑭ</h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-3">+256 755 915 549</p>
                  <Button href="https://wa.me/256755915549" variant="default" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-6">
                    Text Me
                  </Button>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="group"
            >
              <div className="hero-glass-frame relative h-full backdrop-blur-lg">
                <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none" aria-hidden />
                <div className="text-center p-6 rounded-xl bg-gradient-to-br from-primary-800/30 to-primary-600/30 dark:from-primary-800/40 dark:to-primary-600/40 border border-primary-500/30 dark:border-primary-500/40 overflow-hidden shadow-2xl backdrop-blur-sm h-full">
                  <MapPin className="w-8 h-8 text-primary-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-primary-900 dark:text-primary-100 mb-2">ᒪOᑕᗩTIOᑎ</h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-3">Kampala, Uganda</p>
                  <Button href="https://maps.google.com/?q=Kampala,Uganda" variant="default" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-6">
                    Find Me
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Image Modal */}
      <AnimatePresence>
        {phoneDialogOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ceo-phone-dialog-title"
            onClick={() => setPhoneDialogOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="hero-glass-frame relative w-full max-w-[min(100%,340px)] backdrop-blur-lg"
            >
              <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
              <div className="relative rounded-bl-xl rounded-tl-xl rounded-br-none rounded-tr-none border border-primary-500/30 bg-gradient-to-br from-primary-50/95 to-primary-100/90 p-4 shadow-2xl dark:border-primary-600/40 dark:from-neutral-900/95 dark:to-neutral-800/95">
                <ModalCloseButton onClose={() => setPhoneDialogOpen(false)} className="focus-ring-none absolute -right-4 -top-4 z-10" aria-label="Close call dialog" />
                <h4 id="ceo-phone-dialog-title" className="mb-3 text-center text-sm font-semibold text-primary-900 dark:text-primary-100">
                  Call Me
                </h4>
                <ul className="space-y-2">
                  {CALL_NUMBERS.map(({ label, tel }) => (
                    <li key={tel} className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl border border-primary-200/70 bg-white/70 pl-2 pr-2 py-2.5 dark:border-neutral-600/60 dark:bg-neutral-800/60">
                      <a href={`tel:${tel}`} className="min-w-0 text-[11px] font-medium tracking-wide text-primary-800 dark:text-primary-200 sm:text-xs">
                        {label}
                      </a>
                      <Button type="button" variant="circle" size="icon" onClick={() => copyNumber(tel)} className="focus-ring-none h-8 w-8">
                        {copiedTel === tel ? <Check className="h-4 w-4" strokeWidth={1.75} /> : <Copy className="h-4 w-4" strokeWidth={1.75} />}
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

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
              className="relative flex h-full w-full max-h-full flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <ModalCloseButton onClose={closeImageModal} className="absolute right-4 top-24 sm:right-6 sm:top-6 z-20 shrink-0" aria-label="Close photo" />
              <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto p-8">
                <img
                  src={galleryImages[selectedImage]}
                  alt={`CEO Image ${selectedImage + 1}`}
                  className="max-h-full max-w-full w-auto rounded-2xl object-contain shadow-2xl"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
