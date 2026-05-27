import { SHOP_EMAIL, SHOP_WHATSAPP_E164 } from '@/lib/constants/brand-contact'
import type { XavyrLink } from '@/lib/xavyr/types'

export type KnowledgeEntry = {
  id: string
  keywords: string[]
  /** Primary answer (used if answers array is empty) */
  answer: string
  /** Varied phrasings for the same topic */
  answers?: string[]
  links?: XavyrLink[]
  suggestions?: string[]
}

export function pickKnowledgeAnswer(entry: KnowledgeEntry, recent: string[] = []): string {
  const pool = entry.answers?.length ? [...entry.answers, entry.answer] : [entry.answer]
  const recentSet = new Set(recent.map((r) => r.trim().toLowerCase()))
  const available = pool.filter((r) => !recentSet.has(r.trim().toLowerCase()))
  const list = available.length ? available : pool
  return list[Math.floor(Math.random() * list.length)]
}

export const XAVYR_INTRO =
  "Hi, I'm Xavyr, your guide to MysticalPIECES. I can help you find collections, understand how shopping works, and answer questions about the site. What would you like to explore?"

export const SITE_PAGES: XavyrLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/sections/shop' },
  { label: 'About Us', href: '/about-us' },
  { label: 'Core Rules (style guide)', href: '/core-rules' },
  { label: 'CEO Profile', href: '/ceo-profile' },
  { label: 'Your Account', href: '/account' },
  { label: 'Sign in / Register', href: '/login' },
  { label: 'Cart', href: '/cart' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms & Conditions', href: '/terms-conditions' },
]

export const SHOP_CATEGORIES: XavyrLink[] = [
  { label: 'Shirts', href: '/products/shirts' },
  { label: 'Tees', href: '/products/tees' },
  { label: 'Outerwear', href: '/products/coats' },
  { label: 'Bottoms', href: '/products/pants-and-shorts' },
  { label: 'Footwear', href: '/products/footwear' },
  { label: 'Accessories', href: '/products/accessories' },
]

export const DEFAULT_SUGGESTIONS = [
  'Browse collections',
  'How do I order?',
  'Delivery & payment',
  'Contact the store',
]

export const KNOWLEDGE: KnowledgeEntry[] = [
  {
    id: 'greeting',
    keywords: ['help me', 'start', 'begin'],
    answer:
      "Welcome to MysticalPIECES, a future-facing thrift boutique. Tell me what you're looking for, or pick a quick topic below.",
    answers: [
      'Welcome in. I can point you to collections, checkout, or any page on the site.',
      'Good to have you here. What would you like to explore first?',
      'Hello. MysticalPIECES is ready when you are. Ask about shop, cart, or delivery.',
    ],
    suggestions: DEFAULT_SUGGESTIONS,
  },
  {
    id: 'about',
    keywords: ['about', 'mystical', 'brand', 'story', 'who are you', 'what is this', 'thrift', 'boutique'],
    answer:
      'MysticalPIECES curates thrifted and vintage-inspired fashion with a conscious, future-forward spirit. Most pieces are one-of-a-kind finds; some listings offer multiple sizes or colors when we have more than one in stock.',
    links: [
      { label: 'About Us', href: '/about-us' },
      { label: 'Core Rules', href: '/core-rules' },
      { label: 'CEO Profile', href: '/ceo-profile' },
    ],
  },
  {
    id: 'shop',
    keywords: ['shop', 'browse', 'catalog', 'collection', 'products', 'clothes', 'fashion', 'store'],
    answer:
      'Start at the Shop hub for moodboards and category cards, or jump straight into a collection. Use the search icon in the navigation bar to find items by name, brand, or SKU.',
    links: [{ label: 'Open Shop', href: '/sections/shop' }, ...SHOP_CATEGORIES.slice(0, 4)],
    suggestions: ['Shirts', 'Footwear', 'Accessories'],
  },
  {
    id: 'categories',
    keywords: ['shirt', 'tee', 't-shirt', 'coat', 'jacket', 'hoodie', 'pants', 'shorts', 'shoe', 'footwear', 'accessory', 'category', 'categories'],
    answer: 'We organise pieces into six main collections. Each has sub-styles (for example graphic tees, denim shirts, or sneakers).',
    links: SHOP_CATEGORIES,
  },
  {
    id: 'featured',
    keywords: ['featured', 'home', 'new', 'latest', 'highlight'],
    answer:
      'The home page Featured section spotlights in-stock pieces from each collection. The freshest listings appear in the first row; other rows rotate daily so there is always something new to discover.',
    links: [{ label: 'Home', href: '/' }],
  },
  {
    id: 'unique-pieces',
    keywords: ['unique', 'one of a kind', 'single', 'thrift', 'only one', 'sold out'],
    answer:
      'Most MysticalPIECES items are single unique thrift pieces. Once in your cart, that listing is held until checkout. When an order is delivered, unique pieces leave the catalog. Out of Stock means it is gone.',
    suggestions: ['How do I order?', 'Browse collections'],
  },
  {
    id: 'multi-stock',
    keywords: ['size', 'color', 'colour', 'quantity', 'multiple', 'variant', 'stock'],
    answer:
      'Some products offer more than one unit with size and color options. On those items you can choose your combination in Quick View and increase quantity when more than one is available in that size and color.',
    links: [{ label: 'Browse Shop', href: '/sections/shop' }],
  },
  {
    id: 'cart',
    keywords: ['cart', 'bag', 'basket', 'add to cart', 'remove'],
    answer:
      'Use Add to Cart or Quick View on product cards. Your cart icon in the top navigation shows how many items you have. Review everything on the Cart page before checkout.',
    links: [
      { label: 'View Cart', href: '/cart' },
      { label: 'Continue Shopping', href: '/sections/shop' },
    ],
  },
  {
    id: 'checkout',
    keywords: ['checkout', 'order', 'buy', 'purchase', 'confirm', 'place order', 'how to buy'],
    answer:
      'From Cart, go to Checkout, fill in your name, email, phone, and delivery address, choose Kampala (free delivery) or Outside Kampala, then confirm your order. You will land on an order confirmation page with a receipt you can download.',
    links: [
      { label: 'Cart', href: '/cart' },
      { label: 'Checkout', href: '/checkout' },
    ],
  },
  {
    id: 'payment',
    keywords: ['pay', 'payment', 'cash', 'cod', 'money', 'price', 'ugx', 'cost', 'fee'],
    answer:
      'MysticalPIECES uses cash on delivery. You pay when your order arrives. No online card payment is required. Delivery within Kampala is free; outside Kampala carries a transport fee shown at checkout.',
    suggestions: ['Delivery areas', 'Contact the store'],
  },
  {
    id: 'delivery',
    keywords: ['deliver', 'delivery', 'shipping', 'kampala', 'outside', 'address', 'transport'],
    answer:
      'Choose Kampala for free delivery within city limits, or Outside Kampala for wider delivery (a fee applies). Enter your street and city/area clearly at checkout so we can reach you.',
    links: [{ label: 'Checkout', href: '/checkout' }],
  },
  {
    id: 'order-status',
    keywords: ['track', 'status', 'where is my order', 'confirmation', 'receipt', 'order id'],
    answer:
      'After checkout you receive a confirmation page and emails about your order. Sign in to your account to see order history, or check your email for updates as your order moves through processing, dispatch, and delivery.',
    links: [
      { label: 'My Account', href: '/account' },
      { label: 'Sign in', href: '/login' },
    ],
  },
  {
    id: 'account',
    keywords: ['account', 'profile', 'sign up', 'signup', 'register', 'login', 'log in', 'password reset'],
    answer:
      'Create a free account to save your details, view orders, and leave reviews. Use Sign in from the navigation menu or the account icon. Guest checkout is also available without an account.',
    links: [
      { label: 'Sign in / Register', href: '/login' },
      { label: 'My Account', href: '/account' },
    ],
  },
  {
    id: 'contact',
    keywords: ['contact', 'email', 'whatsapp', 'phone', 'support', 'reach', 'question', 'talk'],
    answer: `For personal assistance beyond what I can answer here, reach the MysticalPIECES team at ${SHOP_EMAIL} or WhatsApp ${SHOP_WHATSAPP_E164}. The home page Contact section also has a message form.`,
    links: [{ label: 'Contact (home)', href: '/#contact' }],
  },
  {
    id: 'core-rules',
    keywords: ['rules', 'sape', 'style guide', 'la sape', 'elegance', 'colour', 'color guide'],
    answer:
      'Core Rules is our style philosophy: colour with intention, elegance over price tags, immaculate presentation, and grace in the world. It reflects the spirit behind how we curate and wear MysticalPIECES.',
    links: [{ label: 'Read Core Rules', href: '/core-rules' }],
  },
  {
    id: 'privacy',
    keywords: ['privacy', 'data', 'personal information', 'gdpr'],
    answer: 'Our Privacy Policy explains how we handle your information when you shop or create an account.',
    links: [{ label: 'Privacy Policy', href: '/privacy-policy' }],
  },
  {
    id: 'terms',
    keywords: ['terms', 'conditions', 'policy', 'legal', 'refund', 'return'],
    answer:
      'Terms and Conditions cover shopping agreements, site use, and policies. Because most items are unique thrift pieces, availability is limited. Contact us if you need help with a specific order.',
    links: [
      { label: 'Terms & Conditions', href: '/terms-conditions' },
      { label: 'Contact', href: '/#contact' },
    ],
  },
  {
    id: 'search',
    keywords: ['search', 'find', 'look for', 'sku'],
    answer:
      'Tap the search icon in the top navigation bar and type a product name, brand, or SKU. Matching in-stock items appear as suggestions you can open directly.',
  },
  {
    id: 'navigation',
    keywords: ['navigate', 'menu', 'pages', 'sections', 'sitemap', 'where'],
    answer: 'Here are the main public pages on MysticalPIECES:',
    links: SITE_PAGES,
  },
  {
    id: 'xavyr',
    keywords: ['xavyr', 'who are you', 'your name', 'guide', 'assistant', 'bot'],
    answer:
      "I'm Xavyr, a site guide built for MysticalPIECES shoppers. I help with navigation, collections, and how shopping works here. I don't have access to private store operations or admin tools.",
    answers: [
      'I am Xavyr, your MysticalPIECES guide. Ask me about pages, products, or checkout anytime.',
      'Xavyr here. I know the public side of the store and I am happy to walk you through it.',
      'I guide shoppers around this site. No admin access, just helpful directions and answers.',
    ],
    suggestions: DEFAULT_SUGGESTIONS,
  },
]
