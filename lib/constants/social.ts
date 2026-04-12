import { Mail, Instagram, AtSign } from 'lucide-react'
import { IconBrandWhatsapp, IconBrandTiktok, IconBrandX } from '@tabler/icons-react'
import { SHOP_EMAIL, SHOP_WHATSAPP_E164 } from '@/lib/constants/brand-contact'

export const SOCIAL_LINKS = [
  { name: 'Email', icon: Mail, href: `mailto:${SHOP_EMAIL}` },
  { name: 'Instagram', icon: Instagram, href: 'https://www.instagram.com/mysticalpieces?igsh=cHRhbDdiNzN4ZTJ2&utm_source=qr' },
  { name: 'TikTok', icon: IconBrandTiktok, href: 'https://www.tiktok.com/@mystical.pieces' },
  { name: 'X (Twitter)', icon: IconBrandX, href: 'https://x.com/mysticalpieces?s=21' },
  { name: 'WhatsApp', icon: IconBrandWhatsapp, href: `https://wa.me/${SHOP_WHATSAPP_E164.replace('+', '')}` },
  { name: 'Threads', icon: AtSign, href: 'https://www.threads.com/@mysticalpieces?igshid=NTc4MTIwNjQ2YQ==' }
]


