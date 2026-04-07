import { Mail, Instagram, Youtube } from 'lucide-react'
import { IconBrandWhatsapp, IconBrandTiktok, IconBrandX } from '@tabler/icons-react'
import { SHOP_EMAIL, SHOP_WHATSAPP_E164 } from '@/lib/constants/brand-contact'

export const SOCIAL_LINKS = [
  { name: 'Email', icon: Mail, href: `mailto:${SHOP_EMAIL}` },
  { name: 'Instagram', icon: Instagram, href: 'https://www.instagram.com/iamlrba?igsh=MXcwcTF3b3R6ZG9yeQ%3D%3D&utm_source=qr' },
  { name: 'TikTok', icon: IconBrandTiktok, href: 'https://www.tiktok.com/@iamlrba?_t=ZM-8yRqigzltXK&_r=1' },
  { name: 'X (Twitter)', icon: IconBrandX, href: 'https://x.com/i/status/1952162823766708588' },
  { name: 'WhatsApp', icon: IconBrandWhatsapp, href: `https://wa.me/${SHOP_WHATSAPP_E164.replace('+', '')}` },
  { name: 'YouTube', icon: Youtube, href: 'https://youtube.com/@iamlrba?si=u4gjLZ3rlje5KKj7' }
]


