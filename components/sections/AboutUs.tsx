'use client'

import { useState, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Button from '@/components/ui/Button'
import Image from 'next/image'
import MissionVisionCard from './MissionVisionCard'
import MysticalPiecesWord from '@/components/ui/MysticalPiecesWord'
import AnimatedImageBannerAboutUs from './AnimatedImageBannerAboutUs'
import { 
  Building2, 
  Music, 
  Palette, 
  Code, 
  Shirt,
  Linkedin,
  Instagram,
  Mail,
  ExternalLink,
  Zap
} from 'lucide-react'
import { IconBrandWhatsapp, IconBrandX, IconBrandTiktok } from '@tabler/icons-react'

const teamMembers = [
  {
    id: 1,
    name: "ᒍOᔕᕼᑌᗩ",
    position: "Creative Director",
    description: "A visionary creative director with over 8 years of experience in fashion curation and style direction. Joshua leads our artistic vision and ensures every piece meets the highest style standards.",
    image: "/assets/images/team/joshua-nsereko.jpg",
    hoverImage: "/assets/images/team/joshua-nsereko-hover.jpg",
    social: {
      linkedin: "https://linkedin.com/in/sarahchen",
      instagram: "https://instagram.com/sarahchen",
      x: "https://x.com/sarahchen",
      whatsapp: "+1234567890",
      email: "sarah@fusioncraft.com"
    }
  },
  {
    id: 2,
    name: "ᑎOᗩᕼ",
    position: "Technical Lead",
    description: "A tech-savvy professional with expertise in e-commerce and digital platforms. Noah ensures our online shopping experience is seamless and our digital presence is cutting-edge.",
    image: "/assets/images/team/noah-tayebwa.png",
    hoverImage: "/assets/images/team/noah-tayebwa-hover.jpg",
    social: {
      linkedin: "https://www.linkedin.com/in/ndacyayisenga-droid/",
      instagram: "https://www.instagram.com/p/DCKOuHEChyu/?igsh=MW5uemhmaW15dTRtag==",
      x: "https://twitter.com/NdacyayisengaN1",
      whatsapp: "https://wa.me/256750571027",
      email: "mailto:ndacyayinoah@gmail.com"
    }
  },
  {
    id: 3,
    name: "ᗪIᑎGᗯᗩ",
    position: "Fashion Curator",
    description: "A passionate fashion curator with an eye for unique finds and sustainable style. Dingwa specializes in discovering thrifted treasures and curating collections that blend vintage charm with modern trends.",
    image: "/assets/images/team/dingwa.jpg",
    hoverImage: "/assets/images/team/dingwa-hover.jpg",
    social: {
      tiktok: "https://www.tiktok.com/@iamlrba?_t=ZM-8yRqigzltXK&_r=1",
      instagram: "https://instagram.com/elenapetrov",
      x: "https://x.com/elenapetrov",
      whatsapp: "+1234567890",
      email: "elena@fusioncraft.com"
    }
  }
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
            <p className="text-lg text-primary-600 dark:text-primary-300 leading-relaxed mb-6">
              We blend intuition with modern futurism, bridging tactile history and digital-age aesthetics. We are an invitation to dress with clarity, confidence, and purpose.
            </p>
            <div className="hero-glass-frame relative inline-block backdrop-blur-lg rounded-full">
              <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-full" aria-hidden />
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="relative z-10 inline-flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 text-primary-600 dark:text-primary-300 text-sm md:text-base bg-gradient-to-br from-primary-800/30 to-primary-600/30 dark:from-primary-800/40 dark:to-primary-600/40 px-6 py-3 rounded-full shadow-lg border border-primary-500/30 dark:border-primary-500/40 backdrop-blur-sm"
              >
                <span className="text-primary-800 dark:text-primary-100 font-semibold">Our Core:</span>
                <span
                  className="text-accent-600 dark:text-accent-400 font-bold text-lg sm:text-xl md:text-3xl leading-snug text-center sm:text-left"
                  style={{ fontFamily: '"Mrs Saint Delafield", cursive' }}
                >
                  Hidden treasures reveal a timeless style
                </span>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* CEO Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mb-20"
        >
          <h3 className="text-3xl font-bold text-primary-800 dark:text-primary-100 mb-8">ᗰEET Oᑌᖇ ᑕEO</h3>
          
          <div className="max-w-2xl mx-auto">
            <div className="relative group hero-glass-frame backdrop-blur-lg rounded-2xl flex items-center justify-center w-full">
              <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
              {/* CEO Card - inner like hero animated image */}
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
                
                <Button href="/ceo-profile" variant="default" className="inline-flex items-center space-x-2">
                  <span>View Profile</span>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Team Members */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h3 className="text-3xl font-bold text-primary-800 dark:text-primary-100 mb-12 text-center">Oᑌᖇ TEᗩᗰ</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 * index }}
                className="group"
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
                    <p className="text-primary-600 dark:text-primary-300 text-sm leading-relaxed mb-4">
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
                    <div className="flex justify-center space-x-3 pt-4 border-t border-primary-100">
                      {member.social.tiktok ? (
                        <a
                          href={member.social.tiktok}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-700 transition-colors duration-200"
                        >
                          <IconBrandTiktok className="w-4 h-4" />
                        </a>
                      ) : (
                        <a
                          href={member.social.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-700 transition-colors duration-200"
                        >
                          <Linkedin className="w-4 h-4" />
                        </a>
                      )}
                      <a
                        href={member.social.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-700 transition-colors duration-200"
                      >
                        <Instagram className="w-4 h-4" />
                      </a>
                      <a
                        href={member.social.x}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-700 transition-colors duration-200"
                      >
                        <IconBrandX className="w-4 h-4" />
                      </a>
                      <a
                        href={`https://wa.me/${member.social.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-700 transition-colors duration-200"
                      >
                        <IconBrandWhatsapp className="w-4 h-4" />
                      </a>
                      <a
                        href={`mailto:${member.social.email}`}
                        className="w-8 h-8 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-700 transition-colors duration-200"
                      >
                        <Mail className="w-4 h-4" />
                      </a>
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
          <h3 className="text-3xl font-bold text-primary-800 dark:text-primary-100 mb-12 text-center">Oᑌᖇ ᐯᗩᒪᑌEᔕ</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 px-8 md:px-12 lg:px-16">
            {[
              {
                image: "/assets/images/sections/home/values-1.jpg",
                title: "Intuition",
                description: "We follow subtle cues to choose pieces that resonate now and stay relevant next season."
              },
              {
                image: "/assets/images/sections/home/values-4.jpg",
                title: "Connection",
                description: "Each piece links past and new wardrobes, nurturing a conscious style community."
              },
              {
                image: "/assets/images/sections/home/values-3.jpg",
                title: "Sustainability",
                description: "We honor Earth by extending the life of quality garments and reducing fashion waste."
              },
              {
                image: "/assets/images/sections/home/values-2.jpg",
                title: "Expression",
                description: "We champion refined self-expression, letting minimal silhouettes deliver bold identities."
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
                  <div className="relative z-10 w-40 h-40 bg-gradient-to-br from-primary-800/30 to-primary-600/30 rounded-2xl border border-primary-500/30 dark:border-primary-500/40 overflow-hidden shadow-2xl p-8 flex items-center justify-center">
                    <Image 
                      src={value.image} 
                      alt={`${value.title} value icon`}
                      width={96}
                      height={96}
                      className="w-24 h-24 object-cover rounded-xl"
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
          <h3 className="text-3xl font-bold text-primary-800 dark:text-primary-100 mb-12 text-center">Oᑌᖇ ᗰIᔕᔕIOᑎᔕ</h3>
          
          <div className="space-y-16 flex flex-col items-center max-w-4xl mx-auto">
            {[
              {
                image: "/assets/images/sections/home/missions-1.jpg",
                title: "Future Sourcing",
                description: "To scout standout garments with enduring build, striking detail, and forward aesthetics."
              },
              {
                image: "/assets/images/sections/home/missions-2.jpg",
                title: "Circular Styling",
                description: "To restore pre-loved treasures with care, making circular fashion effortless and stylish."
              },
              {
                image: "/assets/images/sections/home/missions-3.jpg",
                title: "Signature Revelation",
                description: "To help you distill a personal look that feels intuitive, modern, and unmistakably yours."
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
                    <div className="relative z-10 w-40 h-40 bg-gradient-to-br from-primary-800/30 to-primary-600/30 rounded-2xl border border-primary-500/30 dark:border-primary-500/40 overflow-hidden shadow-2xl p-8 flex items-center justify-center">
                      <Image 
                        src={mission.image} 
                        alt={`${mission.title} mission icon`}
                        width={96}
                        height={96}
                        className="w-24 h-24 object-cover rounded-xl"
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
