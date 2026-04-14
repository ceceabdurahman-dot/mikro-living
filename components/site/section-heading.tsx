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
      <h2 className="mt-4 font-headline text-4xl leading-tight text-on-surface md:text-5xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-8 text-on-surface-variant md:text-lg">
        {description}
      </p>
    </div>
  )
}
