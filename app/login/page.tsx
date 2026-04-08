'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User, Phone, Eye, EyeOff, Image as ImageIcon, Camera } from 'lucide-react'
import { AuthManager } from '@/lib/auth'
import MysticalPiecesWord from '@/components/ui/MysticalPiecesWord'
import Button from '@/components/ui/Button'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [profileImage, setProfileImage] = useState<string>('')
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })
  
  const [signupData, setSignupData] = useState({
    email: '',
    fullName: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB')
        return
      }
      
      setProfileImageFile(file)
      
      // Convert to base64 for preview and storage
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setProfileImage('')
    setProfileImageFile(null)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      })
      const payload = await res.json()
      if (!res.ok) {
        setError(payload.error || 'Login failed')
        setLoading(false)
        return
      }
      AuthManager.setSessionUser(payload.user)
      router.push('/account')
    } catch {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (signupData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signupData.email,
          fullName: signupData.fullName,
          phone: signupData.phone,
          password: signupData.password,
          profileImageUrl: profileImage || null,
        }),
      })
      const payload = await res.json()
      if (!res.ok) {
        setError(payload.error || 'Signup failed')
        setLoading(false)
        return
      }
      AuthManager.setSessionUser(payload.user)
      router.push('/account')
    } catch {
      setError('Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const [showBackButton, setShowBackButton] = useState(true)

  // Show/hide back button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      // Show button when at top (within 100px), hide when scrolled down
      setShowBackButton(scrollTop < 100)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Check initial position
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-unified flex items-center justify-center px-4 pt-32 pb-16">
      {/* Fixed Back Button */}
      <motion.div
        animate={{ opacity: showBackButton ? 1 : 0, x: showBackButton ? 0 : -120, y: showBackButton ? 0 : -20 }}
        transition={{ duration: 0.3 }}
        className="fixed top-20 left-4 sm:left-8 z-50 pointer-events-none"
        style={{ pointerEvents: showBackButton ? 'auto' : 'none' }}
      >
        <Link href="/" className="focus-ring-none inline-flex items-center gap-2 text-primary-600 dark:text-primary-300 hover:text-primary-800 dark:hover:text-primary-100 transition-colors duration-300">
          <span className="btn-unified-circle flex-shrink-0">⟸</span>
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
      </motion.div>
      <div className="max-w-md w-full mt-12 pt-16">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="hero-glass-frame relative backdrop-blur-lg rounded-2xl"
        >
          <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none rounded-[inherit]" aria-hidden />
          <div className="relative z-10 bg-white/95 dark:bg-neutral-800 rounded-2xl shadow-xl p-8 border border-neutral-200 dark:border-neutral-700 login-form">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-800 dark:text-primary-100 mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-primary-600 dark:text-primary-300">
              {isLogin ? 'Sign in to your account' : <>Join <MysticalPiecesWord /></>}
            </p>
          </div>

          <div className="mb-6 !rounded-full bg-[rgba(0,0,0,0.06)] dark:bg-[rgba(0,0,0,0.4)] p-[1px] shadow-none">
            <div className="relative grid grid-cols-2 p-[1px]">
              <motion.div
                layout
                animate={{ x: isLogin ? '0%' : '100%' }}
                transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                className="absolute inset-y-[1px] left-[1px] w-[calc(50%-1px)] !rounded-full bg-white dark:bg-neutral-800"
              />
              <button
                type="button"
                onClick={() => { setIsLogin(true); setError('') }}
                aria-pressed={isLogin}
                className={`relative z-10 !rounded-full border border-transparent px-4 py-[9px] text-sm font-medium transition-colors duration-300 appearance-none shadow-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0 dark:focus:ring-0 dark:focus-visible:ring-0 dark:focus-visible:outline-none dark:focus:ring-offset-0 dark:focus-visible:ring-offset-0 active:outline-none active:ring-0 dark:active:outline-none dark:active:ring-0 ${
                  isLogin
                    ? 'text-primary-800 dark:text-primary-100'
                    : 'text-primary-500 dark:text-primary-300 hover:text-primary-700 dark:hover:text-primary-100'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => { setIsLogin(false); setError(''); setProfileImage(''); setProfileImageFile(null) }}
                aria-pressed={!isLogin}
                className={`relative z-10 !rounded-full border border-transparent px-4 py-[9px] text-sm font-medium transition-colors duration-300 appearance-none shadow-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0 dark:focus:ring-0 dark:focus-visible:ring-0 dark:focus-visible:outline-none dark:focus:ring-offset-0 dark:focus-visible:ring-offset-0 active:outline-none active:ring-0 dark:active:outline-none dark:active:ring-0 ${
                  !isLogin
                    ? 'text-primary-800 dark:text-primary-100'
                    : 'text-primary-500 dark:text-primary-300 hover:text-primary-700 dark:hover:text-primary-100'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-400" />
                    <input
                      type="email"
                      required
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className="input-overlay w-full pl-10 pr-4 py-3 rounded-lg text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-all duration-300 dark:bg-neutral-700 dark:text-white"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className="input-overlay w-full pl-10 pr-12 py-3 rounded-lg text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-all duration-300 dark:bg-neutral-700 dark:text-white"
                      placeholder="Enter your password"
                    />
                    <Button
                      type="button"
                      variant="default"
                      size="icon"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 min-w-0 !border-0 !bg-transparent shadow-none"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </Button>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <Button
                  type="submit"
                  variant="default"
                  size="md"
                  disabled={loading}
                  className={`w-full justify-center ${loading ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}`}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </motion.form>
            ) : (
              <motion.form
                key="signup"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSignup}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-400" />
                    <input
                      type="text"
                      required
                      value={signupData.fullName}
                      onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                      className="input-overlay w-full pl-10 pr-4 py-3 rounded-lg text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-all duration-300 dark:bg-neutral-700 dark:text-white"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-400" />
                    <input
                      type="email"
                      required
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      className="input-overlay w-full pl-10 pr-4 py-3 rounded-lg text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-all duration-300 dark:bg-neutral-700 dark:text-white"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-400" />
                    <input
                      type="tel"
                      required
                      value={signupData.phone}
                      onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                      className="input-overlay w-full pl-10 pr-4 py-3 rounded-lg text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-all duration-300 dark:bg-neutral-700 dark:text-white"
                      placeholder="+256 755 915 549"
                    />
                  </div>
                </div>

                {/* Profile Picture Upload */}
                <div>
                  <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                    Profile Picture (Optional)
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      {profileImage ? (
                        <div className="relative">
                          <img
                            src={profileImage}
                            alt="Profile preview"
                            className="w-20 h-20 rounded-full object-cover border-2 border-primary-200 dark:border-neutral-600"
                          />
                          <Button
                            type="button"
                            variant="filled"
                            size="icon"
                            onClick={handleRemoveImage}
                            className="absolute -top-2 -right-2 w-6 h-6 min-w-0 !border-red-500 !bg-red-500 hover:!bg-red-600"
                          >
                            ×
                          </Button>
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-neutral-700 border-2 border-dashed border-primary-300 dark:border-neutral-600 flex items-center justify-center">
                          <Camera className="w-8 h-8 text-primary-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="login-profile-photo"
                      />
                      <label htmlFor="login-profile-photo" className="cursor-pointer block">
                        <Button
                          variant="default"
                          size="sm"
                          type="button"
                          className="w-full justify-center pointer-events-none"
                        >
                          {profileImage ? 'Change Photo' : 'Upload Photo'}
                        </Button>
                      </label>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        Max 5MB, JPG/PNG
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      className="input-overlay w-full pl-10 pr-12 py-3 rounded-lg text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-all duration-300 dark:bg-neutral-700 dark:text-white"
                      placeholder="At least 6 characters"
                    />
                    <Button
                      type="button"
                      variant="default"
                      size="icon"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 min-w-0 !border-0 !bg-transparent shadow-none"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                      className="input-overlay w-full pl-10 pr-4 py-3 rounded-lg text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-all duration-300 dark:bg-neutral-700 dark:text-white"
                      placeholder="Re-enter password"
                    />
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <Button
                  type="submit"
                  variant="default"
                  size="md"
                  disabled={loading}
                  className={`w-full justify-center ${loading ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}`}
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-6 text-center">
            <Link href="/admin/login" className="focus-ring-none text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
              Admin Login
            </Link>
          </div>
        </div>
        </motion.div>
      </div>
    </div>
  )
}

