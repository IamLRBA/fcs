'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import Button from '@/components/ui/Button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    // Don't catch hydration errors - they're usually harmless and resolve on retry
    // Hydration errors are warnings in React 18+, not actual errors
    if (error.message && (error.message.includes('hydration') || error.message.includes('Hydration'))) {
      console.warn('Hydration mismatch detected (non-fatal):', error.message)
      // Return null to let React handle it normally
      return { hasError: false, error: null }
    }
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Log detailed error information for debugging
    if (typeof window !== 'undefined') {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
      console.error('Component stack:', errorInfo.componentStack)

      // Check if it's a hydration error
      if (error.message.includes('hydration') || error.message.includes('Hydration')) {
        console.warn('Hydration error detected - this is usually harmless and will resolve on retry')
      }
    }

    // Here you could log to an error reporting service
    // e.g., Sentry, LogRocket, etc.
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-unified p-4">
          <div className="max-w-md w-full bg-white dark:bg-neutral-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-primary-800 dark:text-primary-100 mb-2">
              Something went wrong
            </h1>
            <p className="text-primary-600 dark:text-primary-300 mb-6">
              We encountered an unexpected error. Please try again or return to the homepage.
            </p>
            {(process.env.NODE_ENV === 'development' || typeof window !== 'undefined') && this.state.error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-left">
                <p className="text-sm font-mono text-red-800 dark:text-red-200 break-all mb-2">
                  {this.state.error.toString()}
                </p>
                {this.state.error.message && (
                  <p className="text-xs text-red-600 dark:text-red-300 mt-2">
                    {this.state.error.message}
                  </p>
                )}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="default"
                onClick={this.handleReset}
                className="inline-flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
              <Button href="/" variant="filled">
                Go Home
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
