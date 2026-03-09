'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { FileText, CheckCircle, AlertCircle, Scale, Users, Shield } from 'lucide-react'
import Button from '@/components/ui/Button'
import MysticalPiecesWord from '@/components/ui/MysticalPiecesWord'

function renderWithMysticalPieces(content: ReactNode, keyPrefix = 'mysticalpieces'): ReactNode {
  // If content is already a React element, return it as-is
  if (typeof content !== 'string') {
    return content
  }

  // If content is a string, apply mystical styling
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
        'By accessing and using this website, you accept and agree to be bound by these terms and conditions',
        'If you disagree with any part of these terms, you may not access our services',
        'We reserve the right to modify these terms at any time',
        'Continued use of our services constitutes acceptance of any changes'
      ]
    },
    {
      icon: Users,
      title: 'Use License',
      content: [
        'Permission is granted to temporarily access our website for personal, non-commercial use',
        'You may not modify or copy materials from this website',
        'You may not use our materials for commercial purposes without written consent',
        'You may not remove any copyright or proprietary notations from materials'
      ]
    },
    {
      icon: Shield,
      title: 'Disclaimer',
      content: [
        'The materials on our website are provided on an "as is" basis',
        'We make no warranties, expressed or implied, about the accuracy or reliability of information',
        'We are not liable for any damages arising from the use of our website',
        'We do not guarantee that our website will be error-free or uninterrupted'
      ]
    },
    {
      icon: Scale,
      title: 'Limitations',
      content: [
        <>In no event shall <MysticalPiecesWord />  be liable for any damages</>,
        'This includes direct, indirect, incidental, or consequential damages',
        'Our liability is limited to the maximum extent permitted by law',
        'Some jurisdictions do not allow limitations on liability'
      ]
    },
    {
      icon: AlertCircle,
      title: 'Governing Law',
      content: [
        'These terms are governed by the laws of Uganda',
        'Any disputes will be resolved in the courts of Uganda',
        'If any provision is found to be unenforceable, the remaining provisions remain in effect',
        <>These terms constitute the entire agreement between you and <MysticalPiecesWord /></>
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-unified">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-primary-100 rounded-full flex items-center justify-center">
            <FileText className="w-10 h-10 text-primary-600" />
          </div>
          <h1 className="text-4xl font-bold text-primary-900 dark:text-primary-100 mb-4">
            Terms and Conditions
          </h1>
          <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
            Please read these terms and conditions carefully before using our website and services.
          </p>
          <p className="text-sm text-neutral-500 mt-4">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </motion.div>

        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-lg border border-neutral-200 dark:border-neutral-700 mb-8"
        >
          <h2 className="text-2xl font-bold text-primary-900 dark:text-primary-100 mb-4">Introduction</h2>
          <p className="text-neutral-700 dark:text-neutral-200 leading-relaxed mb-4">
            These terms and conditions govern your use of the <MysticalPiecesWord />  website and services. 
            By using our website, you accept these terms and conditions in full.
          </p>
          <p className="text-neutral-700 dark:text-neutral-200 leading-relaxed">
            If you disagree with these terms and conditions or any part of them, you must not use our website or services.
          </p>
        </motion.div>

        {/* Terms Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
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
          ))}
        </div>

        {/* Additional Terms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-lg border border-neutral-200 dark:border-neutral-700 mt-8"
        >
          <h2 className="text-2xl font-bold text-primary-900 dark:text-primary-100 mb-4">Additional Terms</h2>
          <div className="space-y-4 text-neutral-700">
            <p>
              <strong>Intellectual Property:</strong> All content on this website, including text, graphics, logos, and software, 
              is the property of <MysticalPiecesWord />  and is protected by copyright laws.
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

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-lg border border-neutral-200 dark:border-neutral-700 mt-8"
        >
          <h2 className="text-2xl font-bold text-primary-900 dark:text-primary-100 mb-4">Contact Us</h2>
          <p className="text-neutral-700 dark:text-neutral-200 leading-relaxed mb-4">
            If you have any questions about these Terms and Conditions, please contact us:
          </p>
          <div className="space-y-2 text-neutral-700 dark:text-neutral-200">
            <p><strong>Email:</strong> jerrylarubafestus@gmail.com</p>
            <p><strong>Phone:</strong> +256774948086</p>
            <p><strong>Address:</strong> Kampala, Uganda</p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-center mt-12"
        >
          <Button href="/" variant="filled" className="inline-flex items-center justify-center px-8">
            Return to Homepage
          </Button>
        </motion.div>
      </main>
    </div>
  )
}
