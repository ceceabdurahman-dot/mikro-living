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
        src="/brand-logo-public.svg"
        alt="MikroLiving"
        width={220}
        height={110}
        priority={priority}
        className={imageClassName}
      />
    </Link>
  )
}
