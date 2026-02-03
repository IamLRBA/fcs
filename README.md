
# MysticalPIECES - Online Thrift 

A modern, interactive e-commerce platform for curated thrift fashion. MysticalPIECES offers a unique shopping experience with carefully selected vintage and second-hand items across multiple categories.

---

## ☰ Features

### ⋆✴︎⌖⋆ E-Commerce Features

- **Product Catalog**: Browse curated thrift fashion across multiple categories
- **Shopping Cart**: Add items to cart with size and color selection
- **Checkout System**: Secure checkout with delivery options
- **Order Management**: Order confirmation with receipt generation
- **Product Search**: Search functionality to find specific items
- **Responsive Design**: Fully responsive across all devices

### 𓂃✍︎ Design System

- **Dark Theme**: Earthy-toned minimalist design with black/white accents
- **Custom Animations**: Tailwind CSS custom keyframes and animations
- **Glass Effects**: Modern backdrop blur and transparency effects
- **Typography**: Inter and JetBrains Mono font families

### ⚛︎ Technology Stack

- **Next.js 15**: App Router with TypeScript
- **Tailwind CSS**: Custom design system with extended utilities
- **Framer Motion**: Smooth animations and transitions
- **Email Integration**: Automated email notifications (SendGrid/SMTP)
- **WhatsApp Integration**: Order notifications via WhatsApp (Green API)
- **Local Storage**: Cart and user preferences management

---

## 🗀 Project Structure

```
mysticalpieces/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   ├── sections/
│   │   └── shop/                # Shop portal page
│   ├── products/
│   │   └── [category]/          # Product category pages
│   ├── cart/                     # Shopping cart page
│   ├── checkout/                 # Checkout page
│   ├── order-confirmation/       # Order confirmation page
│   ├── about-us/                 # About Us page
│   ├── ceo-profile/              # CEO profile page
│   └── api/                      # API routes
│       ├── send-email/           # Email notification API
│       └── send-whatsapp/        # WhatsApp notification API
├── components/                   # Shared UI components
│   ├── layout/                   # Layout components
│   │   ├── Navbar.tsx           # Navigation bar
│   │   └── Footer.tsx           # Footer
│   ├── sections/                 # Page sections
│   │   ├── FashionProducts.tsx  # Product showcase
│   │   ├── FeaturedCollections.tsx
│   │   ├── Testimonials.tsx
│   │   └── Companies.tsx
│   └── ui/                       # UI components
│       ├── LogoMark.tsx
│       ├── BackToTop.tsx
│       └── LoadingSkeleton.tsx
├── lib/                          # Utility libraries
│   ├── cart.ts                  # Cart management
│   ├── products.ts               # Product management
│   ├── emails/                  # Email templates
│   └── whatsapp/                # WhatsApp notifications
├── data/                         # Data files
│   └── products.json            # Product catalog
├── public/                       # Static assets
│   └── assets/
│       ├── images/              # Product and brand images
│       └── videos/              # Fashion videos
├── styles/                       # Global styles
│   └── globals.css
├── tailwind.config.js           # Tailwind configuration
├── next.config.js               # Next.js configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies and scripts
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
   cd mysticalpieces
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
- Add product details: name, price, sizes, colors, images
- Include product descriptions and SKU information

#### Fashion Videos

- Add fashion videos to `/public/assets/videos/fashion/`
- Update video paths in `FashionVideoSection.tsx`
- Recommended formats: MP4, WebM
- Keep file sizes reasonable for web performance

### Modifying Colors and Themes

- Edit `tailwind.config.js` for color schemes
- Update `styles/globals.css` for custom animations
- Modify component-specific styling

### Adding New Product Categories

1. Add category data to `/data/products.json`
2. Create category images in `/public/assets/images/products-sections/fashion/`
3. Add subcategory images for each category
4. Update product routes in `/app/products/[category]/`

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
- Image optimization with Next.js Image
- Code splitting with dynamic imports
- Optimized animations and transitions

---

## 𑁍 Features in Detail

### Shopping Experience

- **Product Browsing**: Browse products by category with beautiful visual layouts
- **Product Details**: View detailed product information with multiple images
- **Shopping Cart**: Add items to cart with size and color selection
- **Checkout Process**: Secure checkout with customer information form
- **Order Confirmation**: Receive order confirmation with downloadable receipt

### Notifications

- **Email Notifications**: Automated emails sent to customers and admins
- **WhatsApp Notifications**: Order confirmations via WhatsApp
- **Receipt Generation**: Automatic receipt generation with order details

### User Interface

- **Dark/Light Mode**: Theme switching with persistent preferences
- **Responsive Design**: Mobile-first approach, fully responsive
- **Smooth Animations**: Framer Motion powered transitions
- **Search Functionality**: Search products across the catalog

---

## ⫘⫘ Animation System

### Framer Motion

- Page transitions
- Scroll-triggered animations
- Hover effects and micro-interactions

### Custom CSS Animations

- Logo animations
- Product card hover effects
- Smooth page transitions
- Loading states
- Scroll-triggered animations

### Performance Considerations

- Hardware acceleration
- Reduced motion support
- Optimized animation loops

---

## ⌯⌲ Future Enhancements

### Planned Features

- [ ] User accounts and authentication
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Payment gateway integration
- [ ] Order tracking system
- [ ] Inventory management
- [ ] Admin dashboard enhancements

### Technical Improvements

- [ ] PWA capabilities
- [ ] Advanced caching strategies
- [ ] SEO optimization
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

- Next.js team for the amazing framework
- Framer Motion for smooth animations
- Three.js community for 3D graphics
- Tailwind CSS for the utility-first approach

---

## ✆ Support

For questions or support:
- Create an issue in the repository
- Contact: [Your Contact Information]
- Website: [Your Website]

---

**Built with ♡ by MysticalPIECES**
*Future-facing thrift fashion curated to awaken individuality, celebrate conscious style, and build modern connections through every garment* 

---
