'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-unified flex items-center justify-center px-4 py-20">
      <div className="max-w-md w-full hero-glass-frame relative backdrop-blur-lg rounded-2xl">
        <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
        <div className="relative z-10 bg-white/95 dark:bg-neutral-800 rounded-2xl shadow-xl p-8 border border-neutral-200 dark:border-neutral-700 text-center">
          <h1 className="text-3xl font-bold text-primary-800 dark:text-primary-100 mb-2">Page not found</h1>
          <p className="text-primary-600 dark:text-primary-300 mb-6">
            The page you&apos;re looking for doesn&apos;t exist or has moved.
          </p>
          <Link
            href="/"
            className="btn-unified inline-flex items-center justify-center px-6 py-3 text-sm font-medium"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
