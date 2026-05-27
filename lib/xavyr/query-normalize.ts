/** Normalize slang, typos, and fashion shorthand before intent matching. */
export function normalizeQuery(raw: string): string {
  let q = raw.trim().toLowerCase()
  q = q.replace(/\s+/g, ' ')

  const replacements: [RegExp, string][] = [
    [/\bpls\b|\bplz\b/g, 'please'],
    [/\bu\b/g, 'you'],
    [/\bur\b/g, 'your'],
    [/\bthx\b|\bty\b/g, 'thanks'],
    [/\bw\/\b/g, 'with'],
    [/\bw\/o\b/g, 'without'],
    [/\bfits?\b/g, 'outfit'],
    [/\bdrip(p(y|ing)?)?\b/g, 'stylish outfit'],
    [/\bfitcheck\b|\bfit check\b/g, 'outfit review'],
    [/\bmain character energy\b/g, 'confident standout style'],
    [/\bold money\b/g, 'old money style'],
    [/\bquiet luxury\b/g, 'quiet luxury style'],
    [/\bsmart casual\b/g, 'smart casual'],
    [/\bbusiness casual\b/g, 'business casual'],
    [/\bmomo\b|\bmobile money\b/g, 'mobile money'],
    [/\bairtel money\b/g, 'airtel money'],
    [/\bmtn\b/g, 'mtn'],
    [/\bauthentic\b|\breal deal\b/g, 'authentic'],
    [/\bvintage\b/g, 'vintage'],
    [/\bdesigner\b/g, 'designer'],
    [/\bcatalogue\b/g, 'catalog'],
    [/\bmysticalpieces\b|\bmystical pieces\b/g, 'mysticalpieces'],
    [/\bdenim shirt(s)?\b/g, 'denim shirts'],
    [/\bstreetwear\b/g, 'streetwear casual'],
    [/\boffice wear\b|\boffice drip\b/g, 'office wear formal'],
    [/\bwedding guest\b|\bwedding fit\b/g, 'wedding outfit'],
    [/\bdate fit\b|\bfirst date\b/g, 'date outfit'],
    [/\b6ft\b|\b6 ft\b/g, 'tall 6 foot'],
    [/\blook expensive\b|\blook rich\b/g, 'look expensive polished'],
    [/\bgentleman\b|\belite gentleman\b/g, 'gentleman style'],
    [/\bcapsule wardrobe\b/g, 'capsule wardrobe'],
    [/\bout of stock\b|\bsold out\b/g, 'availability stock'],
    [/\brestock\b/g, 'restock'],
    [/\bhold (this|it)\b/g, 'reserve item cart'],
  ]

  for (const [re, sub] of replacements) {
    q = q.replace(re, sub)
  }

  return q
}

/** Topics that benefit from Gemini/Groq when local confidence is not high. */
export function isComplexFashionQuery(query: string): boolean {
  const q = normalizeQuery(query)
  return (
    /\b(style|outfit|wear|dress|match|coordinate|layer|aesthetic|vibe|look good|fit check|recommend|suggest|pick|choose|capsule|wardrobe|old money|quiet luxury|business casual|smart casual|formal|semi-formal|occasion|wedding|interview|church|date|funeral|graduation|gentleman|minimalist|monochrome|streetwear|vintage|designer|authentic|condition|stain|damage|true to size|measurement|inseam|chest|waist|shoulder|slim fit|oversized|compare|which is better|rate this|honest|drip|fire outfit|main character|look expensive|look rich|billionaire|movie character|old money|loafers|oxfords|chinos|timeless|color match|dry clean|wash|care for|leather|stain|fade|shrink|capsule|hidden gem|surprise me|upgrade wardrobe|skin tone|body type|face shape|fragrance|hairstyle|pack for trip|season|weather|trend|fashion mistake|wardrobe essential)\b/i.test(
      q
    ) ||
    /\b(how should i|what goes with|what matches|what shoes|build (me )?a|style me|help me dress|help me look|what should i wear|what can i get|what would suit|what fits my)\b/i.test(
      q
    )
  )
}

export function isGeneralKnowledgeQuery(query: string): boolean {
  const q = query.trim()
  return (
    /^\s*where\s+is\s+[a-z][a-z\s-]{2,}\s*\??\s*$/i.test(q) &&
    !/(shop|cart|checkout|account|login|contact|delivery|kampala|mysticalpieces|product|shirts|tees|outerwear|denim|section)/i.test(
      q
    )
  )
}

export function isBuyIntentNotCheckout(query: string): boolean {
  const q = normalizeQuery(query)
  return (
    /\b(want to buy|need to buy|looking to buy|buy some|purchase something|shop for|get some clothes|get some things)\b/i.test(
      q
    ) && !/\b(checkout|confirm order|place order|already in cart)\b/i.test(q)
  )
}
