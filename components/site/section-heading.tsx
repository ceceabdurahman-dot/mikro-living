type SectionHeadingProps = {
  eyebrow: string
  title: string
  description: string
  centered?: boolean
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  centered = false,
}: SectionHeadingProps) {
  return (
    <div className={centered ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-balance font-headline text-3xl leading-[1.02] text-on-surface sm:text-4xl md:text-5xl">
        {title}
      </h2>
      <p className="mt-4 text-sm leading-7 text-on-surface-variant sm:text-base md:text-lg md:leading-8">
        {description}
      </p>
    </div>
  )
}
