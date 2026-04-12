'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const items = [
  'Interior Design',
  '✦',
  'Apartment Living',
  '✦',
  'Custom Furniture',
  '✦',
  'Design & Build',
  '✦',
  'Smart Spaces',
  '✦',
  'Earth Tones',
  '✦',
  'Micro Living',
  '✦',
]

export default function MarqueeStrip() {
  const track1Ref = useRef<HTMLDivElement>(null)
  const track2Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const speed = 40 // seconds for full loop

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
  }, [])

  return (
    <div className="py-5 bg-primary overflow-hidden whitespace-nowrap relative">
      <div className="flex">
        <div ref={track1Ref} className="flex shrink-0">
          {items.map((item, i) => (
            <span
              key={`a-${i}`}
              className="text-on-primary text-sm font-semibold uppercase tracking-[0.2em] px-6"
            >
              {item}
            </span>
          ))}
        </div>
        <div ref={track2Ref} className="flex shrink-0 absolute left-0">
          {items.map((item, i) => (
            <span
              key={`b-${i}`}
              className="text-on-primary text-sm font-semibold uppercase tracking-[0.2em] px-6"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
