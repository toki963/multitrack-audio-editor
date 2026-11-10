import type { LucideIcon } from 'lucide-react'

export function Icon({ icon: IconComponent, size = 16 }: { icon: LucideIcon; size?: number }) {
  return <IconComponent size={size} strokeWidth={1.8} aria-hidden="true" />
}
