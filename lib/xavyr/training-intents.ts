import type { ConversationMatch } from '@/lib/xavyr/types'
import { DEFAULT_SUGGESTIONS, SHOP_CATEGORIES } from '@/lib/xavyr/knowledge'

const SHOP = { label: 'Shop portal', href: '/sections/shop' }
const HOME = { label: 'Home (Featured)', href: '/' }
const SHIRTS = { label: 'Shirts', href: '/products/shirts' }
const TEES = { label: 'Tees', href: '/products/tees' }
const OUTER = { label: 'Outerwear', href: '/products/coats' }
const BOTTOMS = { label: 'Bottoms', href: '/products/pants-and-shorts' }
const FOOT = { label: 'Footwear', href: '/products/footwear' }
const ACC = { label: 'Accessories', href: '/products/accessories' }
const CORE = { label: 'Core Rules', href: '/core-rules' }
const ABOUT = { label: 'About Us', href: '/about-us' }
const CART = { label: 'Cart', href: '/cart' }
const CHECKOUT = { label: 'Checkout', href: '/checkout' }
const CONTACT = { label: 'Contact', href: '/#contact' }
const TERMS = { label: 'Terms', href: '/terms-conditions' }

const ALL_CATS = SHOP_CATEGORIES

/** High-priority training intents from shopper language (product, style, fit, trust, etc.) */
export const TRAINING_INTENTS: ConversationMatch[] = [
  // --- BRAND & IDENTITY ---
  {
    id: 'what-is-mysticalpieces',
    priority: 15,
    patterns: [
      /\bwhat is mysticalpieces\b/i,
      /\bwhat('s| is) mystical pieces\b/i,
      /\btell me about mysticalpieces\b/i,
      /\bwho is mysticalpieces\b/i,
      /\babout mysticalpieces\b/i,
    ],
    responses: [
      'MysticalPIECES is a future-facing thrift boutique based in Kampala, Uganda. We curate unique and vintage-inspired fashion with a conscious, style-forward spirit. Most pieces are one of a kind.',
      'Think curated thrift with personality: shirts, tees, outerwear, bottoms, footwear, and accessories. Browse Shop or Featured on Home to see what is in stock today.',
    ],
    links: [ABOUT, SHOP, CORE],
    suggestions: ['Browse collections', 'How do I order?', 'Delivery & payment'],
  },
  {
    id: 'do-i-know-you',
    priority: 14,
    patterns: [/\bdo i know you\b/i, /\bhave we met\b/i, /\bwho are you again\b/i],
    responses: [
      'We might not have met before. I am Xavyr, the MysticalPIECES site guide. I help with shopping, styling direction, and finding pages.',
      'I am Xavyr. If this is your first time here, ask me about collections, checkout, or what makes our thrift pieces special.',
    ],
    suggestions: DEFAULT_SUGGESTIONS,
  },
  {
    id: 'what-can-you-do',
    priority: 14,
    patterns: [
      /\bwhat can you do for me\b/i,
      /\bwhat can you help with\b/i,
      /\bhow can you help\b/i,
      /\bwhat are you capable of\b/i,
    ],
    responses: [
      'I can help you discover collections, explain sizing and checkout, suggest where to browse, give styling direction, and answer delivery or policy questions.',
      'Product discovery, outfit ideas, navigation, orders, delivery, and general fashion guidance for MysticalPIECES. Tell me your goal and I will narrow it down.',
    ],
    suggestions: ['Browse collections', 'How do I order?', 'Style me for an occasion'],
  },

  // --- CATALOG (fixed patterns for "guys", typos) ---
  {
    id: 'catalog-broad',
    priority: 15,
    patterns: [
      /\bwhat products\b/i,
      /\bwhat do you (guys )?(sell|stock|carry|offer)\b/i,
      /\bwhat are your products\b/i,
      /\bwhat('s| is) in the catalog\b/i,
      /\btell me what you (guys )?sell\b/i,
      /\bwhat items do you have\b/i,
      /\bwhat clothes do you (have|sell)\b/i,
    ],
    responses: [
      'We carry curated thrift across Shirts, Tees, Outerwear, Bottoms, Footwear, and Accessories. Stock rotates because most pieces are unique.',
      'Six main collections: Shirts, Tees, Outerwear, Bottoms, Footwear, Accessories. Open Shop or search the navbar for something specific.',
    ],
    links: [SHOP, SHIRTS, TEES, OUTER],
    suggestions: ['Shirts', 'Outerwear', 'Footwear', 'Accessories'],
  },

  // --- BUY INTENT (not checkout lecture) ---
  {
    id: 'want-to-buy',
    priority: 14,
    patterns: [
      /\bi want to buy\b/i,
      /\bi need to buy\b/i,
      /\blooking to buy\b/i,
      /\bbuy some (things|clothes|stuff|items)\b/i,
      /\bshop for\b/i,
      /\bget some (clothes|things|pieces)\b/i,
    ],
    responses: [
      'Great. Start at Shop or Featured on Home, pick a collection, then use Quick View to check size and details before Add to Cart.',
      'Tell me your vibe or occasion and I will point you to the right collection. When you are ready, Cart then Checkout with your delivery details.',
    ],
    links: [SHOP, HOME, CART],
    suggestions: ['Browse collections', 'Shirts', 'Outerwear', 'How do I order?'],
  },

  // --- PRODUCT DISCOVERY ---
  {
    id: 'new-arrivals',
    priority: 12,
    patterns: [
      /\bwhat('s| is) new\b/i,
      /\bnew (today|arrivals|drops|stock)\b/i,
      /\blatest (drops|arrivals|pieces)\b/i,
      /\bwhat just arrived\b/i,
      /\brecent arrivals\b/i,
    ],
    responses: [
      'Check Featured on the home page for fresh in-stock highlights. Row one shows the newest per category; other rows rotate daily.',
      'Featured on Home is the best place for new finds. Collections also update as pieces are added, so search helps if you want something specific.',
    ],
    links: [HOME, SHOP],
    suggestions: ['Browse collections', 'Shirts', 'Accessories'],
  },
  {
    id: 'search-product-type',
    priority: 12,
    patterns: [
      /\bdo you have (suits|blazers|jackets|formal|vintage|designer|streetwear|office|casual)\b/i,
      /\bshow me (blazers|jackets|suits|formal|vintage|designer|streetwear|outfits|premium|affordable)\b/i,
      /\bneed (a )?(blazer|jacket|suit|formal|office|casual|streetwear)\b/i,
      /\b(any|what) (vintage|designer|luxury|premium|affordable)\b/i,
      /\bbest sellers\b/i,
      /\btrending\b/i,
      /\bhidden gem\b/i,
    ],
    responses: [
      'Inventory is live thrift, so it changes often. Blazers and formal pieces often sit in Outerwear or Shirts. Use Shop and search the navbar for the fastest find.',
      'Try Outerwear for jackets and layers, Shirts for structured tops, Bottoms for trousers, Footwear for shoes. Tell me the piece type and I will link the best collection.',
    ],
    links: [SHOP, OUTER, SHIRTS, BOTTOMS],
    suggestions: ['Outerwear', 'Shirts', 'Browse collections'],
  },
  {
    id: 'filter-budget-color',
    priority: 11,
    patterns: [
      /\b(show|filter|only) (black|navy|white|brown|monochrome)\b/i,
      /\bunder \$\d+/i,
      /\bunder \d+ (usd|dollars|ugx|shilling)/i,
      /\b(cheapest|budget|affordable|premium only|excellent condition|unworn|branded only|size medium|size \d+)\b/i,
      /\bfilter by (price|size|color)\b/i,
    ],
    responses: [
      'Use search in the navbar and browse the relevant collection. Prices and sizes show on each card and in Quick View. Most pieces are unique, so filters are browse-and-spot rather than infinite scroll filters.',
      'Pick a collection first, then scan for your color, size, or price range. If you tell me budget and category, I will point you to the best place to start.',
    ],
    links: [SHOP],
    suggestions: ['Browse collections', 'Shirts', 'Footwear'],
  },
  {
    id: 'availability-stock',
    priority: 13,
    patterns: [
      /\b(is this|still) (available|in stock)\b/i,
      /\bhow many (left|remaining)\b/i,
      /\bwill (this|it) restock\b/i,
      /\bhold (this|it) for me\b/i,
      /\breserve (this|it)\b/i,
      /\bsomeone else viewing\b/i,
      /\bwhen (will you|do you) restock\b/i,
    ],
    responses: [
      'Most MysticalPIECES items are unique thrift: one listing, one piece. Adding to cart holds it while you checkout. Once sold and delivered, it usually does not restock.',
      'Check the product card or Quick View for availability. Multi-size listings show options there. If it says Out of Stock, that unique piece is gone.',
    ],
    links: [CART, SHOP],
    suggestions: ['Browse collections', 'How do I order?'],
  },

  // --- STYLING & OCCASIONS ---
  {
    id: 'style-outfit-help',
    priority: 12,
    patterns: [
      /\bhow should i style\b/i,
      /\bwhat goes (well )?with\b/i,
      /\bwhat (shirt|shoes|tie|belt|accessories) (matches|goes with|with this)\b/i,
      /\b(build|create|put together) (a |an )?(full )?outfit\b/i,
      /\bstyle me for\b/i,
      /\bhelp me dress\b/i,
      /\b(outfit|coordinate|layer) (this|idea|look)\b/i,
      /\bwhat colors go together\b/i,
      /\b(monochrome|capsule wardrobe|signature style)\b/i,
      /\blook (expensive|rich|taller|elegant|masculine|mature)\b/i,
      /\b(old money|quiet luxury|gentleman|ceo|minimalist|streetwear|smart casual|business casual)\b/i,
      /\b(drip me out|fire fit|main character|pick a fit|you got taste)\b/i,
      /\bconvince me to buy\b/i,
      /\b(rate this outfit|does this (look good|fit slap|outfit hard))\b/i,
      /\bwhich is better\b/i,
      /\bbe honest\b/i,
    ],
    responses: [
      'Start with one anchor piece, then match neutral bottoms and one statement accessory. Tell me the occasion (date, office, wedding guest) and colors you like, and I will suggest a collection path.',
      'For thrift, uniqueness is the point: pick a hero piece in Outerwear or Shirts, keep bottoms simple, finish with Footwear or Accessories. Core Rules on this site shares the brand styling philosophy.',
    ],
    links: [CORE, SHOP, OUTER, ACC],
    suggestions: ['Core Rules', 'Outerwear', 'Accessories', 'Browse collections'],
  },
  {
    id: 'occasion-dressing',
    priority: 12,
    patterns: [
      /\b(wedding|church|interview|graduation|funeral|birthday|corporate|night out|vacation|networking|photoshoot|first date)\b/i,
      /\bwhat should i wear to\b/i,
      /\bdress (me )?for (a )?\b/i,
      /\bwedding guest\b/i,
      /\bdate (outfit|fit)\b/i,
      /\boffice drip\b/i,
    ],
    responses: [
      'For weddings and church, think clean lines: a sharp shirt or light blazer from Shirts or Outerwear, tailored bottoms, polished footwear. Tell me dress code level and I will narrow the collection.',
      'Interviews and corporate events: structured shirt, minimal accessories, confident footwear. Dates and nights out: one statement piece plus simple layers. Browse Outerwear and Shirts first.',
    ],
    links: [SHIRTS, OUTER, FOOT, SHOP],
    suggestions: ['Shirts', 'Outerwear', 'Footwear'],
  },

  // --- SIZING & FIT ---
  {
    id: 'sizing-fit',
    priority: 12,
    patterns: [
      /\bwhat size should i\b/i,
      /\bwill this fit\b/i,
      /\btrue to size\b/i,
      /\bruns (small|large|big|oversized)\b/i,
      /\b(chest|waist|inseam|shoulder) (measurement|size|width)\b/i,
      /\bslim fit|regular fit|oversized fit\b/i,
      /\bi wear (zara|medium|large|\d+)\b/i,
      /\b6ft|6 foot|broad.?shoulder|athletic build|skinny|big guy|short men|thick thighs\b/i,
      /\bhelp me choose a size\b/i,
      /\bsize for\b/i,
    ],
    responses: [
      'Check size notes in Quick View on each listing. Thrift sizing varies by brand and era, so compare measurements when shown and ask the team via Contact if you need clarity before ordering.',
      'Tell me your usual size and the item type. I can point you to the collection, but exact fit depends on the specific piece. When in doubt, contact the store with the product name or SKU.',
    ],
    links: [CONTACT, SHOP],
    suggestions: ['Contact the store', 'Browse collections'],
  },

  // --- CONDITION & AUTHENTICITY ---
  {
    id: 'condition-authentic',
    priority: 12,
    patterns: [
      /\b(authentic|original|fake|genuine|verify|real leather|real wool|designer authentic)\b/i,
      /\b(condition|stain|tear|damage|fade|altered|refurbish|dry.?clean|worn out|scratches|premium quality)\b/i,
      /\bhow old is this\b/i,
      /\bis it worth the price\b/i,
      /\bused|preloved|secondhand quality\b/i,
    ],
    responses: [
      'We curate thrift for wearability and character. Condition details appear on the listing when relevant. For a specific piece, open Quick View or contact the team with photos or SKU before you buy.',
      'Authenticity and fabric quality vary by piece. MysticalPIECES focuses on curated finds, not mass replicas. Ask about a specific item via Contact if you need extra reassurance.',
    ],
    links: [CONTACT, TERMS],
    suggestions: ['Contact the store', 'Browse collections'],
  },

  // --- PRICING & PAYMENT ---
  {
    id: 'pricing-discount',
    priority: 12,
    patterns: [
      /\bwhy is this expensive\b/i,
      /\b(discount|negotiate|sale|promo code|cheaper|bulk|best value|price drop|student discount)\b/i,
      /\breserve this item\b/i,
      /\bprices include delivery\b/i,
      /\b(mobile money|momo|mtn|airtel|card|paypal|crypto|installment|pay on delivery|cash on delivery)\b/i,
      /\bpayment (fail|secure|method)\b/i,
    ],
    responses: [
      'Prices are on each product card. Payment is cash on delivery only: no online card required. Kampala delivery is free; outside Kampala shows a fee at checkout.',
      'We do not usually negotiate listed thrift prices because pieces are curated and often unique. For payment questions or order issues, use Contact or WhatsApp.',
    ],
    links: [CHECKOUT, CONTACT],
    suggestions: ['Delivery & payment', 'Contact the store'],
  },

  // --- DELIVERY & RETURNS ---
  {
    id: 'delivery-returns',
    priority: 12,
    patterns: [
      /\b(deliver to|delivery take|ship internationally|same.?day|how much is shipping|track my order|where is my order|shipped yet|pick up|outside uganda|what courier)\b/i,
      /\b(return|exchange|refund|doesn't fit|damaged|change my mind|return shipping)\b/i,
    ],
    responses: [
      'Delivery: Kampala free, Outside Kampala fee at checkout. Cash on delivery when your order arrives. Returns are case by case for unique thrift. See Terms or Contact for order-specific help.',
      'After checkout you get confirmation and email updates. For delivery timing or a return question, contact the team with your order details.',
    ],
    links: [CHECKOUT, TERMS, CONTACT],
    suggestions: ['How do I order?', 'Contact the store'],
  },

  // --- FASHION EDUCATION ---
  {
    id: 'fashion-education',
    priority: 11,
    patterns: [
      /\bwhat is (old money|quiet luxury|business casual|smart casual|capsule wardrobe)\b/i,
      /\bdifference between (loafers|oxfords|chinos|trousers|formal|semi.?formal)\b/i,
      /\bhow should a blazer fit\b/i,
      /\btimeless colors\b/i,
      /\bfashion mistakes\b/i,
      /\bhow many suits\b/i,
      /\bwardrobe essentials\b/i,
      /\bcolor match\b/i,
      /\bfabrics for (hot|warm) weather\b/i,
      /\bfabrics look expensive\b/i,
    ],
    responses: [
      'Old money and quiet luxury favor quality fabrics, neutral palettes, and fit over logos. Core Rules on this site explains MysticalPIECES styling values in depth.',
      'Business casual sits between formal suiting and casual tees: structured shirt, clean bottoms, polished shoes. Browse Shirts and Bottoms to build that base from thrift.',
    ],
    links: [CORE, ABOUT, SHIRTS, BOTTOMS],
    suggestions: ['Read Core Rules', 'Browse collections'],
  },

  // --- GARMENT CARE ---
  {
    id: 'garment-care',
    priority: 11,
    patterns: [
      /\bhow do i (wash|store|care for|remove stain|remove wrinkles|preserve|dry clean)\b/i,
      /\bmachine wash\b/i,
      /\bleather shoes care\b/i,
      /\bstop clothes from fading\b/i,
      /\bcan this shrink\b/i,
      /\bvintage clothes care\b/i,
    ],
    responses: [
      'Care depends on fabric and age. When unsure, gentle wash or dry clean is safest for structured pieces and vintage. Check any care notes on the listing or ask via Contact for a specific item.',
      'Store blazers on wide hangers, keep leather shoes dry and conditioned, and avoid harsh heat on thrift fabrics. I can share general tips, but always follow the garment label when available.',
    ],
    links: [CONTACT],
    suggestions: ['Contact the store', 'Browse collections'],
  },

  // --- ACCOUNT & SUPPORT ---
  {
    id: 'account-support',
    priority: 12,
    patterns: [
      /\b(forgot password|change my address|cancel order|wrong item|missing order|no confirmation|save for later|create account)\b/i,
      /\bcontact support\b/i,
      /\bmy payment failed\b/i,
    ],
    responses: [
      'For account help, use Sign in from the menu. Password and profile updates live there. For order problems, check email confirmation first, then Contact or WhatsApp with your order details.',
      'Guest checkout works without an account. Registered users see order history on Account. Tell me the issue (login, cancel, wrong item) and I will point to the right page.',
    ],
    links: [
      { label: 'Sign in', href: '/login' },
      { label: 'Account', href: '/account' },
      CONTACT,
    ],
    suggestions: ['Contact the store', 'Sign in / Register'],
  },

  // --- TRUST ---
  {
    id: 'trust-legit',
    priority: 12,
    patterns: [
      /\b(is this|are you) (legit|legitimate|trustworthy|a scam)\b/i,
      /\bcan i trust\b/i,
      /\bwhat if i get scammed\b/i,
      /\b(customer reviews|testimonials|customer photos)\b/i,
      /\bsecure payment\b/i,
    ],
    responses: [
      'MysticalPIECES is a real boutique with public contact, policies, and customer testimonials on the home page. Payment is cash on delivery, so you pay when the order arrives.',
      'Browse About Us, Terms, and Contact for transparency. Reviews and testimonials are on Home. For any doubt about an order, reach the team on WhatsApp or email before you worry.',
    ],
    links: [ABOUT, TERMS, CONTACT, HOME],
    suggestions: ['About Us', 'Contact the store'],
  },

  // --- DENIM / CATEGORY NAV ---
  {
    id: 'where-category',
    priority: 13,
    patterns: [
      /\bwhere (is|are) (the )?(shirts|tees|denim|jackets|outerwear|footwear|shoes|accessories|bottoms|pants)\b/i,
      /\bwhere (can i find|is the section for) (denim|shirts|jackets)\b/i,
      /\bsection for denim\b/i,
    ],
    responses: [
      'Denim shirts and shirt styles live under Shirts. Jackets and coats are under Outerwear. Use Shop or the menu to open each collection.',
      'Head to the collection that matches: Shirts for tops, Bottoms for trousers and shorts, Outerwear for layers, Footwear for shoes, Accessories for finishing pieces.',
    ],
    links: [SHIRTS, OUTER, SHOP, ...ALL_CATS.slice(0, 3)],
    suggestions: ['Shirts', 'Outerwear', 'Browse collections'],
  },

  // --- IMAGE / PHOTO (text-only limitation) ---
  {
    id: 'image-upload',
    priority: 13,
    patterns: [
      /\b(rate my fit|fit check|does this outfit look|analyze (this|my) (outfit|photo|picture|fit))\b/i,
      /\b(upload|send) (a )?(photo|picture|image)\b/i,
      /\bfind (clothes|something) similar to this\b/i,
      /\bis this (blazer|jacket|suit) too big\b/i,
      /\brecreate this look\b/i,
    ],
    responses: [
      'I cannot view photos yet in this chat. Describe the piece or occasion (colors, fit, event) and I will suggest collections and styling direction. You can also contact the team with images via WhatsApp.',
      'Photo analysis is not available here right now. Tell me what you are wearing or looking for in words, and I will help you shop or style on MysticalPIECES.',
    ],
    links: [CONTACT, SHOP],
    suggestions: ['Browse collections', 'Contact the store', 'Style me for an occasion'],
  },

  // --- PERSONALIZED RECOMMENDATIONS ---
  {
    id: 'personalized-rec',
    priority: 12,
    patterns: [
      /\brecommend (outfits|colors|something) (for me|based on)\b/i,
      /\bwhat would suit my (skin tone|body type|complexion)\b/i,
      /\b(build me a|suggest a) (capsule|wardrobe)\b/i,
      /\bupgrade my wardrobe\b/i,
      /\bsurprise me\b/i,
      /\boutfit ideas\b/i,
      /\bshopping list\b/i,
      /\bwhat should i buy first\b/i,
      /\bpack for a trip\b/i,
      /\b(outfits by|suggest.*)(weather|season|trend)\b/i,
    ],
    responses: [
      'Tell me three things: occasion, budget range, and one color you love. I will point you to the best collection and a simple outfit formula to browse live stock.',
      'Start with Featured on Home for inspiration, then Shirts or Outerwear for structure, Footwear or Accessories to finish. Share your vibe and I will narrow it further.',
    ],
    links: [HOME, SHOP, OUTER],
    suggestions: ['Browse collections', 'Outerwear', 'Accessories'],
  },

  // --- SLANG SHORT PHRASES ---
  {
    id: 'slang-shopping',
    priority: 11,
    patterns: [
      /\bneed black blazer\b/i,
      /\bcheap suit\b/i,
      /\bdrippy fits\b/i,
      /\bluxury look budget\b/i,
      /\bclean aesthetic\b/i,
      /\bsmart casual inspo\b/i,
      /\bclassy not too expensive\b/i,
      /\bi need aura\b/i,
      /\boffice drip\b/i,
    ],
    responses: [
      'For blazers and structured layers, start with Outerwear and Shirts. Search the navbar for color or style keywords. Thrift means unique stock, so browse soon if something clicks.',
      'Classy on a budget is what we do: one strong piece from Shirts or Outerwear, simple bottoms, one accessory. Tell me your size range and I will link a collection.',
    ],
    links: [OUTER, SHIRTS, SHOP],
    suggestions: ['Outerwear', 'Shirts', 'Browse collections'],
  },
]
