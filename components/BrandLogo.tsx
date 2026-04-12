import Image from 'next/image'
import Link from 'next/link'

type BrandLogoProps = {
  href?: string
  className?: string
  imageClassName?: string
  priority?: boolean
}

export default function BrandLogo({
  href = '/',
  className = '',
  imageClassName = '',
  priority = false,
}: BrandLogoProps) {
  return (
    <Link href={href} className={`inline-flex items-center ${className}`}>
      <Image
        src="/brand-logo-public.png"
        alt="MikroLiving"
        width={759}
        height={587}
        priority={priority}
        className={`h-auto object-contain ${imageClassName}`}
      />
    </Link>
  )
}
