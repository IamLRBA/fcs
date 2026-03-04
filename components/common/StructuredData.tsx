export default function StructuredData() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MysticalPIECES',
    url: 'https://mysticalpieces.com',
    logo: 'https://mysticalpieces.com/assets/images/logo.png',
    description: 'Futuristic thrift fashion curated for seekers of intuitive style, conscious elegance, and modern connection.',
    sameAs: [
      'https://www.instagram.com/mysticalpieces',
      'https://www.facebook.com/mysticalpieces',
      'https://twitter.com/mysticalpieces',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: 'English',
    },
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'MysticalPIECES',
    url: 'https://mysticalpieces.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://mysticalpieces.com/products?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }

  const storeSchema = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: 'MysticalPIECES',
    image: 'https://mysticalpieces.com/assets/images/og-image.jpg',
    description: 'Futuristic thrift fashion curated for seekers of intuitive style, conscious elegance, and modern connection.',
    url: 'https://mysticalpieces.com',
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'US',
    },
  }

  const safeJson = (obj: object) =>
    JSON.stringify(obj).replace(/<\/script/gi, '<\\/script')

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJson(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJson(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJson(storeSchema) }}
      />
    </>
  )
}
