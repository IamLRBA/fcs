'use client'

import { useState, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Image from 'next/image'
import MissionVisionCard from './MissionVisionCard'
import MysticalPiecesWord from '@/components/ui/MysticalPiecesWord'
import AnimatedImageBannerAboutUs from './AnimatedImageBannerAboutUs'
import { Linkedin, Instagram, Mail, ExternalLink, Github } from 'lucide-react'
import { IconBrandWhatsapp, IconBrandX, IconBrandTiktok } from '@tabler/icons-react'

type TeamSocialKind = 'linkedin' | 'github' | 'email' | 'whatsapp' | 'x' | 'tiktok' | 'instagram'

function TeamSocialIcon({ kind }: { kind: TeamSocialKind }) {
  const stroke = 1.5
  switch (kind) {
    case 'linkedin':
      return <Linkedin className="h-5 w-5" strokeWidth={stroke} aria-hidden />
    case 'github':
      return <Github className="h-5 w-5" strokeWidth={stroke} aria-hidden />
    case 'email':
      return <Mail className="h-5 w-5" strokeWidth={stroke} aria-hidden />
    case 'whatsapp':
      return <IconBrandWhatsapp className="h-5 w-5" aria-hidden />
    case 'x':
      return <IconBrandX className="h-5 w-5" aria-hidden />
    case 'tiktok':
      return <IconBrandTiktok className="h-5 w-5" aria-hidden />
    case 'instagram':
      return <Instagram className="h-5 w-5" strokeWidth={stroke} aria-hidden />
    default:
      return null
  }
}

const teamMembers: Array<{
  id: number
  name: string
  position: string
  description: string
  image: string
  hoverImage: string
  social: { kind: TeamSocialKind; href: string; label: string }[]
}> = [
  {
    id: 3,
    name: 'ᗪIᑎGᗯᗩ',
    position: 'Co/Founder & Curator',
    description:
      'The heart of the brand: Dingwa is a law degree student and a passionate fashion curator with an eye for unique finds and sustainable style. He has a specialty in discovering thrifted treasures and curating collections that blend vintage charm with modern trends.',
    image: '/assets/images/team/dingwa.jpg',
    hoverImage: '/assets/images/team/dingwa-hover.jpg',
    social: [
      { kind: 'x', href: 'https://x.com/mulindwayusfu?s=21', label: "Dingwa's X" },
      { kind: 'tiktok', href: 'https://www.tiktok.com/@dingwa0?_r=1&_t=ZS-95LcTo6uMfg', label: "Dingwa's TikTok" },
      { kind: 'email', href: 'mailto:Mulindway3@gmail.com', label: "Dingwa's email" },
      { kind: 'whatsapp', href: 'https://wa.me/256757087093', label: "Dingwa's WhatsApp" },
    ],
  },
  {
    id: 1,
    name: 'ᒍOᔕᕼᑌᗩ',
    position: 'Creative Director',
    description:
      'A visionary creative director with over 8 years of experience in style direction and marketing. Joshua leads our artistic vision and ensures every piece meets the highest style standards.',
    image: '/assets/images/team/joshua-nsereko.jpg',
    hoverImage: '/assets/images/team/joshua-nsereko-hover.jpg',
    social: [
      { kind: 'linkedin', href: 'https://www.linkedin.com/in/jnsereko/', label: "Joshua's LinkedIn" },
      { kind: 'whatsapp', href: 'https://wa.me/256740383427', label: "Joshua's WhatsApp" },
      { kind: 'email', href: 'mailto:nserekojowashi@gmail.com', label: "Joshua's email" },
      { kind: 'github', href: 'https://github.com/jnsereko', label: "Joshua's GitHub" },
    ],
  },
  {
    id: 2,
    name: 'ᑎOᗩᕼ',
    position: 'Technical Lead',
    description:
      'A tech-savvy professional with expertise in e-commerce and digital platforms. Noah ensures our online shopping experience is seamless and our digital presence is cutting-edge.',
    image: '/assets/images/team/noah-tayebwa.jpg',
    hoverImage: '/assets/images/team/noah-tayebwa-hover.jpg',
    social: [
      { kind: 'linkedin', href: 'https://www.linkedin.com/in/ndacyayisenga-droid/', label: "Noah's LinkedIn" },
      { kind: 'instagram', href: 'https://www.instagram.com/p/DCKOuHEChyu/?igsh=MW5uemhmaW15dTRtag==', label: "Noah's Instagram" },
      { kind: 'x', href: 'https://twitter.com/NdacyayisengaN1', label: "Noah's X" },
      { kind: 'whatsapp', href: 'https://wa.me/256750571027', label: "Noah's WhatsApp" },
      { kind: 'email', href: 'mailto:ndacyayinoah@gmail.com', label: "Noah's email" },
      { kind: 'github', href: 'https://github.com/Ndacyayisenga-droid', label: "Noah's GitHub" },
    ],
  },
]

export default function AboutUs() {
  const [hoveredMember, setHoveredMember] = useState<number | null>(null)
  const containerRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  const titleY = useTransform(scrollYProgress, [0, 1], [0, -50])
  const titleScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.1, 1])

  return (
    <section ref={containerRef} className="section bg-unified">
      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="section-title"
          style={{ y: titleY, scale: titleScale }}
        >
          <h2 className="text-5xl md:text-5xl font-bold text-primary-800 dark:text-primary-100 mb-6">
          ᗩᗷOᑌT <span className="text-accent-600 dark:text-accent-100">Us</span>
          </h2>
          <p className="text-xl text-primary-700 dark:text-primary-300 max-w-3xl mx-auto">
            We discover hidden treasures in fashion aimed at unveiling unique pieces that reveal your authentic style.
          </p>
        </motion.div>

        {/* Animated Image Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative w-full py-8 md:py-12 overflow-hidden mb-16"
        >
          <div className="container-custom relative z-10">
            <AnimatedImageBannerAboutUs />
          </div>
        </motion.div>

        {/* Company Description */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-16"
        >
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-primary-600 dark:text-primary-300 leading-relaxed mb-6">
              <MysticalPiecesWord />  began with a vision to connect fashion and style as a mirror of the self. We roam markets and archives to uncover pieces with story, quality, and design integrity.
            </p>
            <div className="hero-glass-frame relative inline-block backdrop-blur-lg rounded-full">
              <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-full" aria-hidden />
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="relative z-10"
              >
                <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }} transition={{ type: 'spring', stiffness: 400, damping: 22 }} className="inline-block">
                  <Link
                    href="/core-rules"
                    className="group relative inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-primary-600 dark:text-primary-300 text-sm md:text-base bg-gradient-to-br from-primary-800/30 to-primary-600/30 dark:from-primary-800/40 dark:to-primary-600/40 px-6 py-3.5 sm:py-3 rounded-full shadow-lg border border-primary-500/30 dark:border-primary-500/40 backdrop-blur-sm transition-[box-shadow,background-color] duration-300 hover:border-primary-500/50 dark:hover:border-primary-400/50 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-100 dark:focus-visible:ring-offset-neutral-900"
                  >
                    <span className="text-primary-800 dark:text-primary-100 font-semibold">Our Core:</span>
                    <span
                      className="text-accent-600 dark:text-accent-400 font-bold text-lg sm:text-xl md:text-2xl leading-snug text-center sm:text-left group-hover:text-accent-700 dark:group-hover:text-accent-300 transition-colors"
                      style={{ fontFamily: 'Mrs Saint Delafield' }}
                    >
                      Check our core rules
                    </span>
                    <span className="sr-only"> — opens the La Sape style rules page</span>
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Meet the team — CEO + team (single section title) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-20"
        >
          <h3 className="text-3xl font-bold text-primary-800 dark:text-primary-100 mb-8 text-center">
            ᗰEET THE TEᗩᗰ
          </h3>

          <div className="text-center max-w-2xl mx-auto">
            <div className="relative group hero-glass-frame backdrop-blur-lg rounded-2xl flex items-center justify-center w-full">
              <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
              <div className="relative z-10 w-full bg-gradient-to-br from-primary-800/20 to-primary-600/20 backdrop-blur-sm rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border border-primary-500/20">
                <div className="w-32 h-32 mx-auto mb-6 relative overflow-hidden rounded-full border-4 border-white shadow-lg">
                  <Image
                    src="/assets/images/team/lrba.jpg"
                    alt="LRBA - CEO and Founder of MysticalPIECES"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="eager"
                    priority
                  />
                  <Image
                    src="/assets/images/team/lrba-hover.jpg"
                    alt="LRBA - CEO"
                    width={128}
                    height={128}
                    className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />
                </div>

                <h4 className="text-2xl font-bold text-primary-800 dark:text-primary-100 mb-2">ᒪᖇᗷᗩ</h4>
                <p className="text-lg text-primary-700 dark:text-primary-300 mb-6">CEO & Founder</p>

                <Button
                  href="/ceo-profile"
                  variant="default"
                  className="about-ceo-cta inline-flex items-center space-x-2 focus-ring-none relative z-10"
                >
                  <span className="relative z-10">View Profile</span>
                  <ExternalLink className="w-4 h-4 relative z-10" />
                </Button>
              </div>
            </div>
          </div>

          {/* Faded-end divider (same idea as footer-divider) */}
          <div
            className="mx-auto mt-12 mb-12 md:mt-14 md:mb-14 h-px w-full max-w-3xl bg-[linear-gradient(90deg,transparent_0%,rgba(38,36,36,0.3)_50%,transparent_100%)] dark:bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.3)_50%,transparent_100%)]"
            role="presentation"
            aria-hidden
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 * index }}
                className={`group ${index === 2 ? 'md:col-span-2 md:mx-auto md:w-full md:max-w-md lg:col-span-1 lg:max-w-none' : ''}`}
                onMouseEnter={() => setHoveredMember(member.id)}
                onMouseLeave={() => setHoveredMember(null)}
              >
                <div className="relative hero-glass-frame backdrop-blur-lg rounded-2xl flex items-center justify-center">
                  <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
                  <div className="relative z-10 w-full bg-primary-800/10 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border border-primary-500/20 relative overflow-hidden">
                  {/* Member Image */}
                  <div className="w-32 h-32 mx-auto mb-6 relative overflow-hidden rounded-full border-4 border-primary-200">
                    <Image
                      src={member.image}
                      alt={`${member.name} - ${member.position}`}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <Image
                      src={member.hoverImage}
                      alt={`${member.name} - ${member.position}`}
                      width={128}
                      height={128}
                      className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    />
                  </div>
                  
                  {/* Member Info - Always Visible */}
                  <div className="text-center mb-4">
                    <h4 className="text-xl font-bold text-primary-800 dark:text-primary-100 mb-2">{member.name}</h4>
                    <p className="text-primary-600 dark:text-primary-300 font-medium">{member.position}</p>
                  </div>
                  
                  {/* Description - Hidden by default, shown on hover */}
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ 
                      opacity: hoveredMember === member.id ? 1 : 0,
                      height: hoveredMember === member.id ? 'auto' : 0
                    }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="text-center text-primary-600 dark:text-primary-300 text-sm leading-relaxed mb-4">
                      {member.description}
                    </p>
                  </motion.div>
                  
                  {/* Social Links - Hidden by default, shown on hover */}
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ 
                      opacity: hoveredMember === member.id ? 1 : 0,
                      height: hoveredMember === member.id ? 'auto' : 0
                    }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="overflow-hidden"
                  >
                    <div className="mb-6 flex flex-wrap justify-center gap-3 border-t border-primary-100 pt-4 pb-2 dark:border-primary-800/60">
                      {member.social.map((link) => (
                        <motion.div
                          key={`${member.id}-${link.kind}`}
                          className="social-link"
                          whileHover={{ scale: 1.1, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Button
                            variant="circle"
                            className="focus-ring-none"
                            href={link.href}
                            {...(link.kind === 'email'
                              ? {}
                              : { target: '_blank', rel: 'noopener noreferrer' })}
                            aria-label={link.label}
                          >
                            <TeamSocialIcon kind={link.kind} />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                  
                  {/* Hover Indicator */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-2 h-2 bg-accent-400 rounded-full"></div>
                  </div>
                </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Values Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-20"
        >
          <h3 className="text-3xl font-bold text-primary-800 dark:text-primary-100 mb-12 text-center">OUR EXPERTISE</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 px-8 md:px-12 lg:px-16">
            {[
              {
                image: "/assets/images/sections/home/values-1.jpg",
                title: "Thrift Sourcing",
                description: "We actively source unique, high-quality thrift pieces for you."
              },
              {
                image: "/assets/images/sections/home/values-2.jpg",
                title: "Style Consultation",
                description: "We help you style outfits that reflect your personality and aesthetic."
              },
              {
                image: "/assets/images/sections/home/values-3.jpg",
                title: "Circular Styling",
                description: "We restore pre-loved treasures making circular fashion effortless and stylish."
              },
              {
                image: "/assets/images/sections/home/values-4.jpg",
                title: "Seamless Delivery",
                description: "We deliver curated fashion pieces with a thoughtful, aesthetic unboxing experience."
              }
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 * index }}
                className={`group ${index % 2 === 0 ? 'text-left' : 'text-right'}`}
              >
                <div className={`flex-shrink-0 relative hero-glass-frame backdrop-blur-lg rounded-2xl inline-flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ${index % 2 === 0 ? 'ml-0 mr-auto' : 'mr-0 ml-auto'}`}>
                  <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
                  <div className="relative z-10 w-40 h-40 bg-gradient-to-br from-primary-800/30 to-primary-600/30 rounded-2xl border border-primary-500/30 dark:border-primary-500/40 overflow-hidden shadow-2xl flex items-center justify-center">
                    <Image 
                      src={value.image} 
                      alt={`${value.title} value icon`}
                      width={160}
                      height={160}
                      className="w-full h-full object-cover rounded-2xl"
                      loading="lazy"
                    />
                  </div>
                </div>
                <div className={`${index % 2 === 0 ? 'text-left' : 'text-right'}`}>
                  <div className={`text-6xl font-bold text-primary-400 dark:text-primary-300 mb-4 ${index % 2 === 0 ? 'text-left' : 'text-right'}`}>
                    0{index + 1}
                  </div>
                  <h4 className="text-2xl font-bold text-primary-800 dark:text-primary-100 mb-4">{value.title}</h4>
                  <p className="text-primary-600 dark:text-primary-300 text-base leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Missions Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mt-20"
        >
          <h3 className="text-3xl font-bold text-primary-800 dark:text-primary-100 mb-12 text-center">
            <span className="text-primary-600 dark:text-primary-200">ᔕᕼOᑭᑭIᑎG</span>{' '}
            <span className="text-primary-800 dark:text-primary-100">Philosophy</span>
          </h3>
          
          <div className="space-y-16 flex flex-col items-center max-w-4xl mx-auto">
            {[
              {
                image: "/assets/images/sections/fashion/philosophy-1.jpg",
                title: "Mysticism",
                description: "There is a deeper reality beyond the visible world. Find meaning in what others might overlook."
              },
              {
                image: "/assets/images/sections/fashion/philosophy-2.jpg",
                title: "Anarchism",
                description: "Every item you choose can be you shaping your own path and challenging the ordinary-fashion norm."
              },
              {
                image: "/assets/images/sections/fashion/philosophy-3.jpg",
                title: "Self-Discovery",
                description: "Evolve with pieces that resonate with your spirit and also help you see yourself more clearly."
              }
            ].map((mission, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 * index }}
                className="w-full"
              >
                <div className={`flex flex-col items-center space-y-8 ${
                  index % 2 === 0 
                    ? 'flex-row space-x-12 md:flex-row md:space-x-12'
                    : 'flex-row-reverse space-x-reverse space-x-12 md:flex-row-reverse md:space-x-reverse md:space-x-12'
                }`}>
                  {/* Image Container - same spacing as Stats impact icon */}
                  <div className="flex-shrink-0 relative hero-glass-frame backdrop-blur-lg rounded-2xl flex items-center justify-center">
                    <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
                    <div className="relative z-10 w-40 h-40 bg-gradient-to-br from-primary-800/30 to-primary-600/30 rounded-2xl border border-primary-500/30 dark:border-primary-500/40 overflow-hidden shadow-2xl flex items-center justify-center">
                      <Image 
                        src={mission.image} 
                        alt={`${mission.title} mission icon`}
                        width={160}
                        height={160}
                        className="w-full h-full object-cover rounded-2xl"
                        loading="lazy"
                      />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className={`flex flex-col flex-1 ${
                    index % 2 === 0 
                      ? 'text-left'
                      : 'text-right'
                  }`}>
                    <div className={`text-6xl font-bold text-primary-400 dark:text-primary-300 mb-4 ${
                      index % 2 === 0 ? '' : 'text-right'
                    }`}>0{index + 1}</div>
                    <h4 className="text-3xl font-bold text-primary-800 dark:text-primary-100 mb-2">{mission.title}</h4>
                    <p className={`text-primary-600 dark:text-primary-300 text-lg ${
                      index % 2 === 0
                        ? 'max-w-md'
                        : 'max-w-md ml-auto'
                    }`}>
                      {mission.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Mission & Vision Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-20"
        >
          <h3 className="text-3xl font-bold text-primary-800 dark:text-primary-100 mb-12 text-center">ᗰIᔕᔕIOᑎ & ᐯIᔕIOᑎ</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[
              { 
                image: "/assets/images/sections/mission/mission-icon.jpg", 
                title: "Mission Statement", 
                description: (
                  <>
                    <MysticalPiecesWord />  exists to awaken individuality and inspire mindful connection through future-minded thrift fashion.
                  </>
                ) 
              },
              { 
                image: "/assets/images/sections/mission/vision-icon.jpg", 
                title: "Vision Statement", 
                description: "We envision a world where fashion and style speaks in intuitive, self-aware tones uniting technology, sustainability, and human-centered design." 
              }
            ].map((item, index) => (
              <MissionVisionCard key={index} item={item} index={index} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
