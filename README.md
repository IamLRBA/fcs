
# MysticalPIECES - Thrift Store & Boutique

A modern, interactive e-commerce site for curated thrift fashion. MysticalPIECES is a thrift store and boutique with pieces curated to awaken individuality, celebrate conscious style, and build modern connections through every garment. The site combines an earthy, mystical design with a full shopping flow: browse by category, cart, checkout, order confirmation, and optional email/WhatsApp notifications.

---

## ☰ Features

### ⋆✴︎⌖⋆ E-Commerce Features

- **Product catalog**: Curated thrift fashion across categories (Shirts, Tees, Coats & Outerwear, Pants & Shorts, Footwear, Accessories) with subcategories and product detail pages
- **Shop portal**: Dedicated shop page with lookbook carousel, style categories (Classy, Retro, etc.), moodboard, and fashion video section
- **Shopping cart**: Add items with size and color selection; cart persisted in local storage
- **Checkout**: Customer details and delivery; order confirmation with receipt generation
- **Product discovery**: Navbar search with live suggestions; browse by category from the home “Enter the Portal” section
- **Responsive layout**: Mobile-first, responsive across all breakpoints

### 𓂃✍︎ Design System

- **Unified theme**: Earthy primary and accent palette (almond, coffee, ecru) with light/dark mode (`bg-unified`, glass frames, hero CTAs)
- **Typography**: MuseoModerno (primary/display), Mrs Saint Delafield, Zen Dots (self-hosted under `public/fonts/`)
- **Glass effects**: Hero glass frames, backdrop blur, gradient overlays, and consistent card treatments across hero, portals, and sections
- **Motion**: Framer Motion for scroll-linked hero scale/opacity, portal and testimonial scale, progress bar, loading screen, and section animations; reduced-motion respected where applicable

### ⚛︎ Technology Stack

- **Next.js** (App Router) with TypeScript
- **Tailwind CSS**: Custom design system (primary, neutral, accent), extended utilities, and `globals.css` (animations, hero/CTA styles, footer)
- **Framer Motion**: Page and scroll-based animations, loading overlay, portal transitions
- **Icons**: react-icons (Heroicons hi/hi2), Lucide React, and custom inline SVGs in the Navbar
- **Integrations**: SendGrid/nodemailer for email; WhatsApp (e.g. Green API/Twilio) for order notifications
- **State & data**: Local storage (cart, preferences, first-visit flag); product catalog in `data/products.json`; optional Prisma for admin/accounts

---

## 🗀 Project Structure

```
mystical_pieces/
├── app/                              # Next.js App Router
│   ├── layout.tsx                     # Root layout (fonts, Navbar, Footer, Providers, SkipToContent, BackToTop, etc.)
│   ├── page.tsx                      # Home (hero, progress bar, LoadingScreen, AnimatedImageBanner, FeaturedCollections, Portals, Stats, Testimonials, Contact)
│   ├── about-us/                      # About Us page (AboutUs section + CTA to shop)
│   ├── ceo-profile/                  # CEO profile (gallery, skills, Educational Journey timeline, GET IN TOUCH)
│   ├── sections/
│   │   └── shop/                     # Shop portal (lookbook, style categories, moodboard, FashionVideoSection, FashionProducts)
│   ├── products/
│   │   └── [category]/               # Product category pages (dynamic category + sections)
│   ├── cart/                         # Shopping cart page
│   ├── checkout/                      # Checkout page
│   ├── order-confirmation/           # Order confirmation + receipt
│   ├── account/                      # Account page
│   ├── login/                        # Login page
│   ├── terms-conditions/              # Terms & Conditions
│   ├── privacy-policy/               # Privacy Policy
│   ├── admin/                        # Admin (login, dashboard, accounts, products)
│   └── api/
│       ├── send-email/                # Email notification API
│       └── send-whatsapp/             # WhatsApp notification API
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx                 # Top nav (logo, Home, Shop, About Us, search, cart, account/settings)
│   │   └── Footer.tsx                 # Social links, tagline, copyright, legal links
│   ├── sections/
│   │   ├── AboutUs.tsx                # About content + CEO “View Profile” CTA
│   │   ├── AnimatedImageBanner.tsx
│   │   ├── AnimatedImageBannerAboutUs.tsx
│   │   ├── Contact.tsx                # GET IN TOUCH (email, phone, etc.)
│   │   ├── EducationalJourney.tsx     # CEO timeline (desktop center spine + mobile left spine)
│   │   ├── FeaturedCollections.tsx
│   │   ├── FashionProducts.tsx
│   │   ├── FashionVideoSection.tsx
│   │   ├── Stats.tsx
│   │   ├── Testimonials.tsx
│   │   ├── Companies.tsx
│   │   └── MissionVisionCard.tsx
│   └── ui/                            # LogoMark, MysticalPiecesWord, Button, BackToTop, LoadingScreen, PortalNavigation, etc.
├── lib/                               # cart, products, emails, whatsapp, constants (e.g. social)
├── data/
│   └── products.json                 # Product catalog by category/section (UGX pricing, condition, SKU, images)
├── public/
│   └── assets/
│       ├── images/                    # Product and brand images
│       └── videos/                    # Fashion videos
├── styles/
│   └── globals.css                    # Base, components, utilities, hero/CTA, footer, animations
├── tailwind.config.js                 # Theme (primary, neutral, accent, fonts, keyframes)
├── next.config.js
├── tsconfig.json
└── package.json
```

---

## 🕸 Product Categories

### 1. Shirts

- **Gentle**: Soft, comfortable shirt styles
- **Checked**: Classic checked patterns
- **Textured**: Textured fabric variations
- **Denim**: Denim shirt collection

### 2. Tees

- **Plain**: Simple, versatile t-shirts
- **Graphic**: Graphic design t-shirts
- **Collared**: Collared t-shirt styles
- **Sporty**: Athletic and sporty designs

### 3. Coats & Outerwear

- **Sweater**: Cozy sweater collection
- **Hoodie**: Casual hoodie styles
- **Coat**: Classic coat designs
- **Jacket**: Various jacket styles

### 4. Pants & Shorts

- **Gentle**: Comfortable pant styles
- **Denim**: Denim pants and shorts
- **Cargo**: Cargo pant collection
- **Sporty**: Athletic wear

### 5. Footwear

- **Gentle**: Comfortable shoe styles
- **Sneakers**: Athletic sneaker collection
- **Sandals**: Casual sandal options
- **Boots**: Boot styles

### 6. Accessories

- **Rings & Necklaces**: Jewelry collection
- **Shades & Glasses**: Eyewear options
- **Bracelets & Watches**: Timepieces and bracelets
- **Decor**: Fashion decor items

---

## ⛟ Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mystical_pieces
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Run the development server**
   ```bash
   npm run dev
   ```
4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

---

## 𓅓 Customization

### Adding Products

#### Product Images

- Add product images to `/public/assets/images/products/`
- Organize by category and subcategory
- Recommended formats: JPG, PNG, WebP
- Optimize for web (compress, resize)

#### Product Data

- Update product catalog in `/data/products.json`
- Add product details: name, price_ugx, sizes, colors, images, description, condition, sku
- Structure by category and subcategory sections

#### Fashion Videos

- Add fashion videos to `/public/assets/videos/fashion/`
- Update video paths in `FashionVideoSection.tsx`
- Recommended formats: MP4, WebM
- Keep file sizes reasonable for web performance

### Modifying Colors and Themes

- Edit `tailwind.config.js` for primary, neutral, and accent colors
- Update `styles/globals.css` for custom animations, hero/CTA, and footer styles
- Modify component-specific styling as needed

### Adding New Product Categories

1. Add category data to `/data/products.json`
2. Create category images in `/public/assets/images/products-sections/fashion/` (or equivalent)
3. Add subcategory images for each category
4. Ensure product routes in `/app/products/[category]/` support the new category

---

## ✇ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting (recommended)
- Component-based architecture

### Performance Optimization

- Lazy loading for heavy components
- Image optimization with Next.js Image where used
- Code splitting with dynamic imports
- Optimized animations and reduced-motion support

---

## 𑁍 Features in Detail

### Shopping Experience

- **Product browsing**: Browse by category from the home portals section and from the Shop nav link; category pages with sections and product cards
- **Product details**: Detail views with multiple images, size/color selection, add to cart
- **Shopping cart**: Cart in local storage; cart page and navbar cart count
- **Checkout**: Customer and delivery form; order confirmation with downloadable receipt

### Notifications

- **Email**: Automated emails to customers and admins (SendGrid/nodemailer via `/api/send-email`)
- **WhatsApp**: Order confirmations via WhatsApp (e.g. Green API/Twilio via `/api/send-whatsapp`)
- **Receipt**: Receipt generation with order details

### User Interface

- **Dark/Light mode**: Theme switching with persistent preferences
- **Responsive design**: Mobile-first, responsive across devices
- **Motion**: Framer Motion for hero, portals, testimonials, loading screen, and section transitions
- **Search**: Navbar search with live product suggestions

---

## ⫘⫘ Animation System

### Framer Motion

- Hero scroll-linked scale, opacity, and parallax
- Portal and testimonial section scale on scroll
- Progress bar tied to scroll progress
- Loading screen (first visit) with completion callback
- Scroll-triggered and hover-based transitions across sections

### Custom CSS Animations

- Logo and hero animations
- Product card hover effects
- Keyframes in `globals.css` (fadeIn, slideUp, float, etc.)
- Loading states and scroll-triggered effects

### Performance Considerations

- Hardware-accelerated transforms where appropriate
- Reduced motion support in timeline and motion-heavy components
- Conditional animation usage for accessibility

---

## ⌯⌲ Future Enhancements

### Planned Features

- [ ] User accounts and authentication (beyond current login/account/admin)
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Payment gateway integration
- [ ] Order tracking system
- [ ] Inventory management
- [ ] Admin dashboard enhancements

### Technical Improvements

- [ ] PWA capabilities (manifest and icons already in place)
- [ ] Advanced caching strategies
- [ ] SEO optimization (metadata, StructuredData in layout)
- [ ] Analytics integration
- [ ] Performance monitoring

---

## ೱ Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## ⓘ License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 𓂀 Acknowledgments

- Next.js team for the framework
- Framer Motion for smooth animations
- Tailwind CSS for the utility-first approach
- react-icons and Lucide for icons

---

## ✆ Support

For questions or support:
- Create an issue in the repository
- Contact: [Your Contact Information]
- Website: [Your Website]

---

**Built with ♡ by MysticalPIECES**  
*Thrift store & boutique with pieces curated to awaken individuality, celebrate conscious style, and build modern connections through every garment*

---
