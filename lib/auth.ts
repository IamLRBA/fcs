// lib/auth.ts - User authentication and management

export interface User {
  id: string
  email: string
  fullName: string
  phone: string
  createdAt: string
  profileImage?: string
  lastViewedItems?: string[]
  reviews?: Review[]
  /** When false, user cannot log in. Admin-only. */
  isActive?: boolean
}

export interface Review {
  id: string
  text: string
  rating: number
  createdAt: string
  productId?: string
  productName?: string
}

export interface Admin {
  username: string
  password: string
}

const ADMIN_CREDENTIALS: Admin = {
  username: 'IamMYSTICAL',
  password: 'Mystic@l1212'
}

export class AuthManager {
  private static USERS_KEY = 'mysticalpieces_users'
  private static CURRENT_USER_KEY = 'mysticalpieces_current_user'
  private static ADMIN_KEY = 'mysticalpieces_admin'
  private static REVIEWS_KEY = 'mysticalpieces_reviews'

  // User Management
  static signUp(email: string, fullName: string, phone: string, password: string, profileImage?: string): { success: boolean; error?: string; user?: User } {
    if (typeof window === 'undefined') {
      return { success: false, error: 'Not available on server' }
    }

    const users = this.getUsers()
    
    // Check if user already exists
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'User with this email already exists' }
    }

    const newUser: User = {
      id: `USER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email: email.toLowerCase(),
      fullName,
      phone,
      createdAt: new Date().toISOString(),
      profileImage,
      lastViewedItems: [],
      reviews: [],
      isActive: true
    }

    // Store user with password (in production, hash passwords!)
    const userData = { ...newUser, password }
    users.push(userData)
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users))

    // Auto-login after signup
    this.setCurrentUser(newUser)

    return { success: true, user: newUser }
  }

  static login(email: string, password: string): { success: boolean; error?: string; user?: User } {
    if (typeof window === 'undefined') {
      return { success: false, error: 'Not available on server' }
    }

    const users = this.getUsers()
    const userData = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password)

    if (!userData) {
      return { success: false, error: 'Invalid email or password' }
    }
    if (userData.isActive === false) {
      return { success: false, error: 'Account is deactivated. Contact support.' }
    }

    const { password: _, ...user } = userData
    this.setCurrentUser(user)

    return { success: true, user }
  }

  static logout(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(this.CURRENT_USER_KEY)
    window.dispatchEvent(new CustomEvent('authStateChanged'))
  }

  static getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null
    const userData = localStorage.getItem(this.CURRENT_USER_KEY)
    return userData ? JSON.parse(userData) : null
  }

  /** Set current user from server-auth response. */
  static setSessionUser(user: User): void {
    this.setCurrentUser(user)
  }

  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null
  }

  private static getUsers(): any[] {
    if (typeof window === 'undefined') return []
    const usersData = localStorage.getItem(this.USERS_KEY)
    return usersData ? JSON.parse(usersData) : []
  }

  static getUsersList(): any[] {
    return this.getUsers()
  }

  private static setCurrentUser(user: User): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user))
    window.dispatchEvent(new CustomEvent('authStateChanged'))
  }

  // Update user info
  static updateUser(userId: string, updates: Partial<User>): boolean {
    if (typeof window === 'undefined') return false

    const users = this.getUsers()
    const userIndex = users.findIndex(u => u.id === userId)

    if (userIndex === -1) return false

    users[userIndex] = { ...users[userIndex], ...updates }
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users))

    // Update current user if it's the same user
    const currentUser = this.getCurrentUser()
    if (currentUser && currentUser.id === userId) {
      const updatedUser = { ...currentUser, ...updates }
      this.setCurrentUser(updatedUser)
      
      // If profile image was updated, update all reviews with this user's name
      if (updates.profileImage !== undefined) {
        const allReviews = this.getAllReviews()
        const updatedReviews = allReviews.map((review: any) => {
          // Check if review belongs to this user (by matching author name)
          if (review.author === updatedUser.fullName) {
            return {
              ...review,
              image: updatedUser.profileImage || '/assets/images/testimonials/default.jpg'
            }
          }
          return review
        })
        localStorage.setItem(this.REVIEWS_KEY, JSON.stringify(updatedReviews))
        window.dispatchEvent(new CustomEvent('reviewsUpdated'))
      }
    }

    return true
  }

  // Track viewed items
  static addViewedItem(productId: string): void {
    const user = this.getCurrentUser()
    if (!user) return

    const lastViewed = user.lastViewedItems || []
    // Remove if already exists and add to beginning
    const filtered = lastViewed.filter(id => id !== productId)
    const updated = [productId, ...filtered].slice(0, 20) // Keep last 20 items

    this.updateUser(user.id, { lastViewedItems: updated })
  }

  // Reviews
  static addReview(text: string, rating: number, productId?: string, productName?: string): { success: boolean; error?: string; review?: Review } {
    const user = this.getCurrentUser()
    if (!user) {
      return { success: false, error: 'Not signed in' }
    }

    const review: Review = {
      id: `REV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text,
      rating,
      createdAt: new Date().toISOString(),
      productId,
      productName
    }

    // Add to user's reviews (DB-backed users may not exist in local USERS_KEY — still sync session + testimonials)
    const userReviews = user.reviews || []
    const mergedReviews = [...userReviews, review]
    const persisted = this.updateUser(user.id, { reviews: mergedReviews })
    if (!persisted) {
      this.setCurrentUser({ ...user, reviews: mergedReviews })
    }

    // Add to global reviews (for testimonials)
    const allReviews = this.getAllReviews()
    allReviews.push({
      ...review,
      author: user.fullName,
      image: user.profileImage || '/assets/images/testimonials/default.jpg'
    })
    localStorage.setItem(this.REVIEWS_KEY, JSON.stringify(allReviews))

    window.dispatchEvent(new CustomEvent('reviewsUpdated'))

    return { success: true, review }
  }

  static getAllReviews(): any[] {
    if (typeof window === 'undefined') return []
    const reviewsData = localStorage.getItem(this.REVIEWS_KEY)
    return reviewsData ? JSON.parse(reviewsData) : []
  }

  // Admin Management
  static adminLogin(username: string, password: string): boolean {
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.ADMIN_KEY, 'true')
        window.dispatchEvent(new CustomEvent('adminStateChanged'))
      }
      return true
    }
    return false
  }

  static adminLogout(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(this.ADMIN_KEY)
    window.dispatchEvent(new CustomEvent('adminStateChanged'))
  }

  static isAdmin(): boolean {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(this.ADMIN_KEY) === 'true'
  }

  /** Admin: set user active/inactive. */
  static setUserActive(userId: string, active: boolean): boolean {
    return this.updateUser(userId, { isActive: active })
  }

  /** Admin: delete user by id. */
  static deleteUser(userId: string): boolean {
    if (typeof window === 'undefined') return false
    const users = this.getUsers().filter((u: any) => u.id !== userId)
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users))
    const current = this.getCurrentUser()
    if (current?.id === userId) this.logout()
    window.dispatchEvent(new CustomEvent('authStateChanged'))
    return true
  }

  /** Admin: set new password for user. */
  static resetUserPassword(userId: string, newPassword: string): boolean {
    const users = this.getUsers()
    const u = users.find((x: any) => x.id === userId)
    if (!u) return false
    u.password = newPassword
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users))
    return true
  }

  /** Admin: restore a previously deleted user (used for undo). */
  static restoreUser(rawUser: any): boolean {
    if (typeof window === 'undefined') return false
    const users = this.getUsers()
    if (users.find((u: any) => u.id === rawUser.id)) return false
    users.push(rawUser)
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users))
    window.dispatchEvent(new CustomEvent('authStateChanged'))
    return true
  }
}

/** Named export for restoreUser (undo delete). */
export function restoreUser(rawUser: any): boolean {
  return AuthManager.restoreUser(rawUser)
}

