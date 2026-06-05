'use client'

import { motion } from 'framer-motion'
import { Shield, Eye, Lock, Users, FileText } from 'lucide-react'
import Button from '@/components/ui/Button'
import MysticalPiecesWord from '@/components/ui/MysticalPiecesWord'
import { SHOP_EMAIL } from '@/lib/constants/brand-contact'
import ScrollScale from '@/components/motion/ScrollScale'

export default function PrivacyPolicy() {
  const sections = [
    {
      icon: Eye,
      title: 'Information We Collect',
      content: [
        'Personal information (name, email, phone number) when you contact us',
        'Usage data and analytics to improve our services',
        'Cookies and similar technologies for website functionality',
        'Information you provide through our contact forms'
      ]
    },
    {
      icon: Lock,
      title: 'How We Use Your Information',
      content: [
        'To provide and maintain our services',
        'To communicate with you about our services',
        'To improve our website and user experience',
        'To comply with legal obligations'
      ]
    },
    {
      icon: Users,
      title: 'Information Sharing',
      content: [
        'We do not sell, trade, or rent your personal information',
        'We may share information with trusted service providers',
        'We may disclose information if required by law',
        'Your information is protected by strict confidentiality agreements'
      ]
    },
    {
      icon: Shield,
      title: 'Data Security',
      content: [
        'We implement appropriate security measures',
        'Your data is encrypted during transmission',
        'We regularly review and update our security practices',
        'Access to your information is limited to authorized personnel'
      ]
    },
    {
      icon: FileText,
      title: 'Your Rights',
      content: [
        'Right to access your personal information',
        'Right to correct inaccurate information',
        'Right to request deletion of your data',
        'Right to opt-out of marketing communications'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-unified">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <ScrollScale as="section" variant="centerPeak" intensity="subtle" className="mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-primary-100 rounded-full flex items-center justify-center">
            <Shield className="w-10 h-10 text-primary-600" />
          </div>
          <h1 className="text-4xl font-bold text-primary-900 dark:text-primary-100 mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
            At <MysticalPiecesWord /> , we are committed to protecting your privacy and ensuring the security of your personal information.
          </p>
          <p className="text-sm text-neutral-500 mt-4">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </motion.div>
        </ScrollScale>

        <ScrollScale as="section" variant="centerPeak" intensity="subtle" className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-lg border border-neutral-200 dark:border-neutral-700"
        >
          <h2 className="text-2xl font-bold text-primary-900 dark:text-primary-100 mb-4">Introduction</h2>
          <p className="text-neutral-700 dark:text-neutral-200 leading-relaxed mb-4">
            This Privacy Policy describes how <MysticalPiecesWord />  ("we," "us," or "our") collects, uses, and protects your personal information 
            when you visit our website, use our services, or interact with us in any way.
          </p>
          <p className="text-neutral-700 dark:text-neutral-200 leading-relaxed">
            By using our services, you agree to the collection and use of information in accordance with this policy. 
            If you have any questions about this Privacy Policy, please contact us.
          </p>
        </motion.div>
        </ScrollScale>

        <div className="space-y-8">
          {sections.map((section, index) => (
            <ScrollScale as="section" key={section.title} variant="centerPeak" intensity="subtle">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              className="bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-lg border border-neutral-200 dark:border-neutral-700"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                  <section.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-2xl font-bold text-primary-900 dark:text-primary-100">{section.title}</h3>
              </div>
              <ul className="space-y-3">
                {section.content.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start">
                    <div className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-neutral-700 dark:text-neutral-200 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            </ScrollScale>
          ))}
        </div>

        <ScrollScale as="section" variant="centerPeak" intensity="subtle" className="mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-lg border border-neutral-200 dark:border-neutral-700"
        >
          <h2 className="text-2xl font-bold text-primary-900 dark:text-primary-100 mb-4">Contact Us</h2>
          <p className="text-neutral-700 dark:text-neutral-200 leading-relaxed mb-4">
            If you have any questions about this Privacy Policy or our data practices, please contact us:
          </p>
          <div className="space-y-2 text-neutral-700 dark:text-neutral-200">
            <p><strong>Email:</strong> {SHOP_EMAIL}</p>
            <p><strong>Phone:</strong> +256774948086</p>
            <p><strong>Address:</strong> Kampala, Uganda</p>
          </div>
        </motion.div>
        </ScrollScale>

        <ScrollScale as="section" variant="centerPeak" intensity="subtle" className="mt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="text-center"
        >
          <Button href="/" variant="filled" className="inline-flex items-center justify-center px-8">
            Return to Homepage
          </Button>
        </motion.div>
        </ScrollScale>
      </main>
    </div>
  )
}
