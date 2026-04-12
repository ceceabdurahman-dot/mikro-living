'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const defaultItems = [
  'Interior Design',
  'Apartment Living',
  'Custom Furniture',
  'Design & Build',
  'Smart Spaces',
  'Earth Tones',
  'Micro Living',
]

export default function MarqueeStrip({
  items = defaultItems,
}: {
  items?: string[]
}) {
  const track1Ref = useRef<HTMLDivElement>(null)
  const track2Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const speed = 40

    if (track1Ref.current && track2Ref.current) {
      const width = track1Ref.current.offsetWidth

      gsap.set(track2Ref.current, { x: width })

      gsap.to([track1Ref.current, track2Ref.current], {
        x: `-=${width}`,
        duration: speed,
        ease: 'none',
        repeat: -1,
        modifiers: {
          x: gsap.utils.unitize((x) => parseFloat(x) % width),
        },
      })
    }
  }, [items])

  const renderItem = (item: string, key: string) => (
    <div key={key} className="flex shrink-0 items-center">
      <span className="px-6 text-sm font-semibold uppercase tracking-[0.2em] text-on-primary">
        {item}
      </span>
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-on-primary/80" />
    </div>
  )

  return (
    <div className="relative overflow-hidden whitespace-nowrap bg-primary py-5">
      <div className="flex">
        <div ref={track1Ref} className="flex shrink-0">
          {items.map((item, i) => renderItem(item, `a-${i}`))}
        </div>
        <div ref={track2Ref} className="absolute left-0 flex shrink-0">
          {items.map((item, i) => renderItem(item, `b-${i}`))}
        </div>
      </div>
    </div>
  )
}
