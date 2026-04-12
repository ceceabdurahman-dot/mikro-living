import Image from 'next/image'

type CmsBrandLogoProps = {
  className?: string
  imageClassName?: string
  priority?: boolean
}

export default function CmsBrandLogo({
  className = '',
  imageClassName = '',
  priority = false,
}: CmsBrandLogoProps) {
  return (
    <div className={`inline-flex items-center ${className}`}>
      <Image
        src="/brand-logo-cms.ico"
        alt="MikroLiving CMS"
        width={96}
        height={96}
        priority={priority}
        className={imageClassName}
      />
    </div>
  )
}
