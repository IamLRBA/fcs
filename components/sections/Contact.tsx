'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Send } from 'lucide-react'
import { IconBrandWhatsapp } from '@tabler/icons-react'
import Button from '@/components/ui/Button'

const contactInfo = [
  { title: 'EᗰᗩIᒪ', subtitle: 'jerrylarubafestus@gmail.com', icon: Mail, buttonText: 'Email Us', action: () => window.open('mailto:jerrylarubafestus@gmail.com', '_blank'), color: 'from-primary-500 to-primary-600' },
  { title: 'ᑭᕼOᑎE', subtitle: '+256 774 948 086', icon: Phone, buttonText: 'Call Us', action: () => { const numbers = ['+256774948086', '+256755915549']; const selected = window.confirm(`Choose a number to call:\n1. ${numbers[0]}\n2. ${numbers[1]}`); if (selected !== null) { const number = numbers[selected ? 1 : 0]; window.open(`tel:${number}`, '_blank') } }, color: 'from-accent-500 to-accent-600' },
  { title: 'ᗯᕼᗩTᔕᗩᑭᑭ', subtitle: '+256 755 915 549', icon: IconBrandWhatsapp, buttonText: 'Text Us', action: () => window.open('https://wa.me/256755915549', '_blank'), color: 'from-accent-500 to-accent-600' },
  { title: 'ᒪOᑕᗩTIOᑎ', subtitle: 'Kampala, Uganda', icon: MapPin, buttonText: 'Find Us', action: () => window.open('https://maps.google.com/?q=Kampala,Uganda', '_blank'), color: 'from-primary-500 to-primary-600' },
]

export default function Contact() {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', subject: '', message: '' })
  const [contactMethod, setContactMethod] = useState<'email' | 'whatsapp'>('email')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (contactMethod === 'email') {
        const mailtoLink = `mailto:jerrylarubafestus@gmail.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
          `Name: ${formData.firstName} ${formData.lastName}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
        )}`
        window.open(mailtoLink, '_blank')
      } else {
        const whatsappMessage = `*New Contact Form Submission*\n\n*Name:* ${formData.firstName} ${formData.lastName}\n*Email:* ${formData.email}\n*Subject:* ${formData.subject}\n\n*Message:*\n${formData.message}`
        const whatsappLink = `https://wa.me/256755915549?text=${encodeURIComponent(whatsappMessage)}`
        window.open(whatsappLink, '_blank')
      }
      setFormData({ firstName: '', lastName: '', email: '', subject: '', message: '' })
      alert('Message sent successfully!')
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Error sending message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="section relative overflow-hidden">
      <div className="container-custom">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="section-title">
          <h2 className="text-4xl md:text-5xl font-bold text-primary-800 dark:text-primary-100 mb-6">GET Iᑎ <span className="text-accent-600 dark:text-accent-300">TOᑌᑕᕼ</span></h2>
          <p className="text-xl text-primary-700 dark:text-primary-300 max-w-3xl mx-auto">Any questions about our fashion collection? Need styling advice? Contact us and we're here to help you find answers.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {contactInfo.map((info, index) => {
            const Icon = info.icon as any
            return (
              <motion.div key={info.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.1 * index }} className="group">
                <div className="hero-glass-frame relative h-full backdrop-blur-lg">
                  <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none" aria-hidden />
                <div className="text-center p-6 rounded-xl bg-gradient-to-br from-primary-800/30 to-primary-600/30 dark:from-primary-800/40 dark:to-primary-600/40 border border-primary-500/30 dark:border-primary-500/40 overflow-hidden shadow-2xl backdrop-blur-sm h-full">
                  <Icon className="w-8 h-8 text-primary-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-primary-900 dark:text-primary-100 mb-2">{info.title}</h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-3">{info.subtitle}</p>
                  <Button variant="default" onClick={info.action} className="inline-flex items-center justify-center px-6">
                    {info.buttonText}
                  </Button>
                </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4 }} className="max-w-4xl mx-auto">
          <div className="hero-glass-frame relative backdrop-blur-lg">
            <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none" aria-hidden />
          <div className="bg-gradient-to-br from-primary-800/30 to-primary-600/30 dark:from-primary-800/40 dark:to-primary-600/40 rounded-2xl p-8 shadow-lg border border-primary-500/30 dark:border-primary-500/40 backdrop-blur-sm">
            <h3 className="text-3xl font-bold text-primary-800 dark:text-primary-100 mb-8 text-center">ᔕEᑎᗪ ᑌᔕ ᗩ ᗰEᔕᔕᗩGE</h3>
            <form onSubmit={handleSubmit} className="send-us-message-form space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">First Name *</label>
                  <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} required className="input-overlay w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-all duration-300" placeholder="Enter your first name" />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">Last Name *</label>
                  <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} required className="input-overlay w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-all duration-300" placeholder="Enter your last name" />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">Email Address *</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required className="input-overlay w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-all duration-300" placeholder="Enter your email address" />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">Subject *</label>
                <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleInputChange} required className="input-overlay w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-all duration-300" placeholder="What is this about?" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">Message *</label>
                <textarea id="message" name="message" value={formData.message} onChange={handleInputChange} required rows={5} className="input-overlay w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-all duration-300 resize-none" placeholder="Tell us about your project or inquiry..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-4">How would you like to be contacted? *</label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input type="radio" name="contactMethod" value="email" checked={contactMethod === 'email'} onChange={(e) => setContactMethod(e.target.value as 'email' | 'whatsapp')} />
                    <div className="flex items-center space-x-2"><Mail className="w-5 h-5 text-primary-600" /><span className="text-primary-700 font-medium">Email</span></div>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input type="radio" name="contactMethod" value="whatsapp" checked={contactMethod === 'whatsapp'} onChange={(e) => setContactMethod(e.target.value as 'email' | 'whatsapp')} />
                    <div className="flex items-center space-x-2"><IconBrandWhatsapp className="w-5 h-5 text-primary-600" /><span className="text-primary-700 font-medium">WhatsApp</span></div>
                  </label>
                </div>
              </div>
              <div className="text-center">
                <Button
                  type="submit"
                  variant="default"
                  size="md"
                  disabled={isSubmitting}
                  className={`inline-flex items-center space-x-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? (
                    <>
                      <span className="inline-block w-5 h-5 rounded-md skeleton opacity-90" aria-hidden />
                      <span>Sending…</span>
                    </>
                  ) : (
                    <>
                      {contactMethod === 'email' ? (<><Mail className="w-5 h-5" /><span>Send Email</span></>) : (<><IconBrandWhatsapp className="w-5 h-5" /><span>Send Message</span></>)}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}


