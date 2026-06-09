'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { FileText, CheckCircle, AlertCircle, Scale, Users, Shield } from 'lucide-react'
import Button from '@/components/ui/Button'
import MysticalPiecesWord from '@/components/ui/MysticalPiecesWord'
import { SHOP_EMAIL } from '@/lib/constants/brand-contact'
import ScrollScale from '@/components/motion/ScrollScale'
import { HeroEntrance } from '@/components/motion/HeroEntrance'

function renderWithMysticalPieces(content: ReactNode, keyPrefix = 'mysticalpieces'): ReactNode {
  if (typeof content !== 'string') {
    return content
  }

  const parts = content.split('MysticalPIECES')
  const elements: ReactNode[] = []

  parts.forEach((part, index) => {
    if (part) {
      elements.push(<span key={`${keyPrefix}-text-${index}`}>{part}</span>)
    }
    if (index < parts.length - 1) {
      elements.push(<MysticalPiecesWord key={`${keyPrefix}-brand-${index}`} />)
    }
  })

  return elements
}

export default function TermsConditions() {
  const sections = [
    {
      icon: CheckCircle,
      title: 'Acceptance of Terms',
      content: [
        'By accessing and using our website, you accept and agree to be bound by these terms and conditions',
        'If you do not agree to these terms, please do not use our website or services',
        'We reserve the right to modify these terms at any time without prior notice',
        'Your continued use of the website after changes constitutes acceptance of the new terms'
      ]
    },
    {
      icon: Users,
      title: 'User Responsibilities',
      content: [
        'You must provide accurate and complete information when using our services',
        'You are responsible for maintaining the confidentiality of your account information',
        'You agree not to use our services for any unlawful or prohibited purpose',
        'You must not attempt to gain unauthorized access to our systems or networks'
      ]
    },
    {
      icon: Scale,
      title: 'Orders and Payments',
      content: [
        'All orders are subject to availability and confirmation',
        'Prices are listed in Ugandan Shillings (UGX) unless otherwise stated',
        'We reserve the right to refuse or cancel any order at our discretion',
        'Payment must be completed before order processing begins'
      ]
    },
    {
      icon: AlertCircle,
      title: 'Limitation of Liability',
      content: [
        'We are not liable for any indirect, incidental, or consequential damages',
        'Our liability is limited to the amount paid for the specific product or service',
        'We do not guarantee uninterrupted or error-free service',
        'You use our website and services at your own risk'
      ]
    },
    {
      icon: Shield,
      title: 'Governing Law',
      content: [
        'These terms are governed by the laws of Uganda',
        'Any disputes shall be resolved in the courts of Kampala, Uganda',
        'If any provision is found to be unenforceable, the remaining provisions remain in effect',
        <>These terms constitute the entire agreement between you and <MysticalPiecesWord /></>
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-unified">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <ScrollScale as="section" variant="centerPeak" intensity="subtle" className="mb-12">
          <HeroEntrance variant="seal" className="text-center">
            <HeroEntrance.Piece role="icon">
              <div className="w-20 h-20 mx-auto mb-6 bg-primary-100 rounded-full flex items-center justify-center">
                <FileText className="w-10 h-10 text-primary-600" />
              </div>
            </HeroEntrance.Piece>
            <HeroEntrance.Piece role="title">
              <h1 className="text-4xl font-bold text-primary-900 dark:text-primary-100 mb-4">
                Terms and Conditions
              </h1>
            </HeroEntrance.Piece>
            <HeroEntrance.Piece role="subtitle">
              <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
                Please read these terms and conditions carefully before using our website and services.
              </p>
            </HeroEntrance.Piece>
            <HeroEntrance.Piece role="meta">
              <p className="text-sm text-neutral-500 mt-4">
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </HeroEntrance.Piece>
          </HeroEntrance>
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
              These terms and conditions govern your use of the <MysticalPiecesWord /> website and services.
              By using our website, you accept these terms and conditions in full.
            </p>
            <p className="text-neutral-700 dark:text-neutral-200 leading-relaxed">
              If you disagree with these terms and conditions or any part of them, you must not use our website or services.
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
                      <span className="text-neutral-700 dark:text-neutral-200 leading-relaxed">
                        {renderWithMysticalPieces(item, `terms-section-${index}-${itemIndex}`)}
                      </span>
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
            <h2 className="text-2xl font-bold text-primary-900 dark:text-primary-100 mb-4">Additional Terms</h2>
            <div className="space-y-4 text-neutral-700">
              <p>
                <strong>Intellectual Property:</strong> All content on this website, including text, graphics, logos, and software,
                is the property of <MysticalPiecesWord /> and is protected by copyright laws.
              </p>
              <p>
                <strong>Privacy:</strong> Your privacy is important to us. Please review our Privacy Policy, which also governs
                your use of our website.
              </p>
              <p>
                <strong>Contact Information:</strong> If you have any questions about these terms and conditions, please contact us.
              </p>
            </div>
          </motion.div>
        </ScrollScale>

        <ScrollScale as="section" variant="centerPeak" intensity="subtle" className="mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-lg border border-neutral-200 dark:border-neutral-700"
          >
            <h2 className="text-2xl font-bold text-primary-900 dark:text-primary-100 mb-4">Contact Us</h2>
            <p className="text-neutral-700 dark:text-neutral-200 leading-relaxed mb-4">
              If you have any questions about these Terms and Conditions, please contact us:
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
            transition={{ duration: 0.6, delay: 1.2 }}
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
