'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { SOCIAL_LINKS } from '@/lib/constants/social'
import MysticalPiecesWord from '@/components/ui/MysticalPiecesWord'
import LogoMark from '@/components/ui/LogoMark'
import Button from '@/components/ui/Button'

export default function Footer() {
  return (
    <footer className="footer relative text-neutral-850 dark:text-white overflow-hidden border-t border-primary-700/30 dark:border-neutral-700">
      <div className="footer-wave"></div>
      <div className="footer-content container-custom relative z-10">
        <div className="social-links">
          {SOCIAL_LINKS.map((social) => {
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
        <div className="footer-divider"></div>
        <div className="copyright-section">
          <Link href="/" className="focus-ring-none footer-logo group">
            <LogoMark size={140} className="transition-transform duration-300 group-hover:scale-110" />
          </Link>
          <Link href="/" className="focus-ring-none tagline brand-name leading-tight inline-block hover:opacity-90 transition-opacity">
            <MysticalPiecesWord /> 
          </Link>
          <div className="footer-inner-outer relative backdrop-blur-lg rounded-2xl p-4 sm:p-6 w-full max-w-2xl border border-neutral-200/80 dark:border-neutral-600/80 overflow-hidden">
            <div className="relative z-10 rounded-xl bg-primary-200/60 dark:bg-neutral-800/70 border border-primary-300/50 dark:border-neutral-600/60 p-4 sm:p-6">
              <div className="flex flex-col items-center gap-3">
              <p className="tagline text-1xl md:text-2xl font-light text-center m-0">
                Style that transcends the ordinary.
              </p>
              <p className="copyright m-0">
                © {new Date().getFullYear()} <MysticalPiecesWord /> . All rights reserved.
              </p>
              <p className="copyright2 m-0">Designed by <Button variant="circle" href="https://github.com/IamLRBA" target="_blank" rel="noopener noreferrer" className="focus-ring-none align-middle ml-1" aria-label="LRBA on GitHub">ᒪᖇᗷᗩ</Button></p>
              <div className="legal-links">
            <Link href="/privacy-policy" className="focus-ring-none legal-link">Privacy Policy</Link>
            <span className="separator">•</span>
            <Link href="/terms-conditions" className="focus-ring-none legal-link">Terms & Conditions</Link>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .footer { position: relative; }
      `}</style>
      <style jsx global>{`
        .footer::after {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background: linear-gradient(to bottom, var(--color-primary-100), var(--color-primary-200));
          opacity: 0.78;
        }
        .dark .footer::after {
          background: linear-gradient(to bottom, #191919, #252525);
          opacity: 0.76;
        }
        .footer-inner-outer {
          position: relative;
        }
        .footer-inner-outer > * { position: relative; z-index: 1; }
        .footer-wave { position: absolute; top: -10px; left: 0; width: 100%; height: 20px; background: linear-gradient(135deg, transparent 0%, transparent 30%, var(--color-primary-900) 30%, var(--color-primary-900) 35%, transparent 35%, transparent 65%, var(--color-primary-900) 65%, var(--color-primary-900) 70%, transparent 70%, transparent 100%); background-size: 40px 20px; }
        .dark .footer-wave { background: linear-gradient(135deg, transparent 0%, transparent 30%, var(--color-primary-200) 30%, var(--color-primary-200) 35%, transparent 35%, transparent 65%, var(--color-primary-200) 65%, var(--color-primary-200) 70%, transparent 70%, transparent 100%); background-size: 40px 20px; }
        .footer-content { padding: 3rem 0 2rem; text-align: center; }
        .social-links { display: flex; justify-content: center; align-items: center; gap: 1.5rem; margin-bottom: 2rem; }
        .social-link { transition: all 0.3s ease; }
        .social-link:hover { transform: translateY(-2px); }
        .footer-divider { width: 100%; height: 1px; background: linear-gradient(90deg, transparent 0%, rgba(38, 36, 36, 0.3) 50%, transparent 100%); margin: 2rem 0; }
        .dark .footer-divider { background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%); }
        .copyright-section { display: flex; flex-direction: column; align-items: center; gap: 1rem; }
        .footer-logo { margin-bottom: 0.5rem; display: flex; justify-content: center; }
        .tagline { color: var(--color-primary-700); margin: 0; font-weight: var(--font-weight-light); letter-spacing: 0.02em; }
        .tagline.brand-name { font-size: 2.3rem !important; }
        @media (min-width: 768px) {
          .tagline.brand-name { font-size: 3.3rem !important; }
        }
        @media (min-width: 1024px) {
          .tagline.brand-name { font-size: 4.3rem !important; }
        }
        .dark .tagline { color: var(--color-primary-300); }
        .copyright { font-size: 0.875rem; color: var(--color-primary-700); margin: 0; }
        .dark .copyright { color: var(--color-primary-300); }
        .copyright2 { font-size: 0.75rem; color: rgba(38, 36, 36, 0.7); margin: 0; display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 0.25rem; }
        .dark .copyright2 { color: rgba(255, 255, 255, 0.6); }
        .legal-links { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem; }
        .legal-link { color: rgba(38, 36, 36, 0.7); text-decoration: none; font-size: 0.75rem; transition: color 0.3s ease; }
        .legal-link:hover { color: var(--color-primary-700); }
        .dark .legal-link { color: rgba(255, 255, 255, 0.6); }
        .dark .legal-link:hover { color: white; }
        .separator { color: rgba(38, 36, 36, 0.5); font-size: 0.75rem; }
        .dark .separator { color: rgba(255, 255, 255, 0.4); }
        @media (max-width: 640px) { .social-links { gap: 1rem; } .social-link { width: 2.5rem; height: 2.5rem; min-width: 2.5rem; min-height: 2.5rem; } .social-link svg { width: 20px; height: 20px; } }
      `}</style>
    </footer>
  )
}


