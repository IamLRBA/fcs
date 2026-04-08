import type { Metadata } from 'next'
import '../styles/globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Providers from '@/components/layout/Providers'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import StructuredData from '@/components/common/StructuredData'
import SkipToContent from '@/components/ui/SkipToContent'
import AccountPromptPopup from '@/components/ui/AccountPromptPopup'
import BackToTop from '@/components/ui/BackToTop'
import KeyboardShortcuts from '@/components/ui/KeyboardShortcuts'
import BackgroundOverlayPortal from '@/components/common/BackgroundOverlayPortal'
import ScrollToTopOnRouteChange from '@/components/common/ScrollToTopOnRouteChange'

export const metadata: Metadata = {
  title: 'MysticalPIECES - Future-Facing Thrift Store & Boutique',
  description: 'Futuristic thrift fashion curated to awaken individuality, celebrate conscious style, and build modern connections through every garment.',
  keywords: 'futuristic thrift fashion, modern vintage clothing, conscious style, sustainable fashion, intuitive wardrobe, future-forward thrift, curated fashion pieces',
  authors: [{ name: 'LRBA', url: 'https://mysticalpieces.com' }],
  creator: 'MysticalPIECES',
  publisher: 'MysticalPIECES',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://mysticalpieces.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'MysticalPIECES - Future-Facing Thrift Store & Boutique',
    description: 'Futuristic thrift fashion curated to awaken individuality, celebrate conscious style, and build modern connections through every garment.',
    url: 'https://mysticalpieces.com',
    siteName: 'MysticalPIECES',
    images: [
      {
        url: '/assets/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'MysticalPIECES',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MysticalPIECES - Future-Facing Thrift Store & Boutique',
    description: 'Futuristic thrift fashion curated to awaken individuality, celebrate conscious style, and build modern connections through every garment.',
    images: ['/assets/images/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="/assets/images/branding/logo-dark.png" />
        <link rel="shortcut icon" href="/assets/images/branding/logo-dark.png" />
        <link rel="apple-touch-icon" href="/assets/images/branding/logo-dark.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6F4E37" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <StructuredData />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <Providers>
          <ErrorBoundary>
            <BackgroundOverlayPortal />
            <ScrollToTopOnRouteChange />
            <div className="relative z-10 min-h-screen flex flex-col">
              <SkipToContent />
              <Navbar />
              <main id="main-content" className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
            <AccountPromptPopup />
            <BackToTop />
            <KeyboardShortcuts />
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  )
} 