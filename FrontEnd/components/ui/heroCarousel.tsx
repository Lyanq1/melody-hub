/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import 'keen-slider/keen-slider.min.css'
import { useKeenSlider } from 'keen-slider/react'
import Image from 'next/image'
import React, { useState, useEffect, useRef } from 'react'

const images = [
  'https://theme.hstatic.net/1000304920/1001307865/14/slide_logo_4.jpg?v=455',
  'https://theme.hstatic.net/1000304920/1001307865/14/slide_logo_3.jpg?v=455',
  'https://theme.hstatic.net/1000304920/1001307865/14/slide_logo_5.jpg?v=455'
  // Thêm các ảnh khác nếu muốn
]

function Arrow(props: { disabled: boolean; left?: boolean; onClick: (e: any) => void }) {
  const disabled = props.disabled ? ' arrow--disabled' : ''
  return (
    <svg
      onClick={props.onClick}
      className={`arrow ${props.left ? 'arrow--left' : 'arrow--right'} ${disabled}`}
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      width={32}
      height={32}
      style={{ cursor: props.disabled ? 'not-allowed' : 'pointer', opacity: props.disabled ? 0.3 : 1 }}
    >
      {props.left ? (
        <path d='M16.67 0l2.83 2.829-9.339 9.175 9.339 9.167-2.83 2.829-12.17-11.996z' fill='white' />
      ) : (
        <path d='M5 3l3.057-3 11.943 12-11.943 12-3.057-3 9-9z' fill='white' />
      )}
    </svg>
  )
}

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    initial: 0,
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel)
    },
    created() {
      setLoaded(true)
    },
    loop: true,
    slides: { perView: 1 },
    mode: 'snap',
    drag: true
  })

  // Auto-switch slides every 5 seconds
  useEffect(() => {
    if (loaded && instanceRef.current && !isPaused) {
      intervalRef.current = setInterval(() => {
        instanceRef.current?.next()
      }, 2000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [loaded, instanceRef, isPaused])

  // Pause auto-switching when mouse is over the carousel
  const handleMouseEnter = () => {
    setIsPaused(true)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  const handleMouseLeave = () => {
    setIsPaused(false)
  }

  return (
    <div 
      className='w-full max-w-5xl mx-auto mt-6 rounded-lg overflow-hidden shadow-lg relative'
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className='navigation-wrapper'>
        <div ref={sliderRef} className='keen-slider'>
          {images.map((src, idx) => (
            <div className='keen-slider__slide' key={idx}>
              <Image src={src} alt={`Hero ${idx + 1}`} width={1200} height={350} unoptimized />
            </div>
          ))}
        </div>
        {loaded && instanceRef.current && (
          <>
            <div className='absolute top-1/2 left-2 z-10 -translate-y-1/2'>
              <Arrow
                left
                onClick={(e) => e.stopPropagation() || instanceRef.current?.prev()}
                disabled={currentSlide === 0 && !instanceRef.current.options.loop}
              />
            </div>
            <div className='absolute top-1/2 right-2 z-10 -translate-y-1/2'>
              <Arrow
                onClick={(e) => e.stopPropagation() || instanceRef.current?.next()}
                disabled={
                  currentSlide === instanceRef.current.track.details.slides.length - 1 && 
                  !instanceRef.current.options.loop
                }
              />
            </div>
          </>
        )}
      </div>
      {loaded && instanceRef.current && (
        <div className='flex justify-center gap-2 mt-4'>
          {Array.from({ length: instanceRef.current.track.details.slides.length }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => instanceRef.current?.moveToIdx(idx)}
              className={`w-3 h-3 rounded-full ${
                currentSlide === idx ? 'bg-primary' : 'bg-gray-300'
              } transition-colors`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
