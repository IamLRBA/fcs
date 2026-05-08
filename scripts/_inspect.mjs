import fs from 'fs'
const s = fs.readFileSync('c:/Users/User/mystical_pieces/components/sections/FashionProducts.tsx', 'utf8')
const idx = s.indexOf('Quote className="w-6')
console.log(JSON.stringify(s.slice(Math.max(0, idx - 90), idx + 100)))
