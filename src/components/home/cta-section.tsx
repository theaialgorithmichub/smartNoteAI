'use client'

import { SpiralAnimation } from '@/components/ui/spiral-animation'
import { useState, useEffect } from 'react'

export function CTASection() {
  const [visible, setVisible] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])
  
  return (
    <section className="relative h-[600px] overflow-hidden">
      {/* Spiral Animation Background */}
      <div className="absolute inset-0">
        <SpiralAnimation />
      </div>
      
      {/* Content Overlay */}
      <div 
        className={`
          absolute inset-0 flex items-center justify-center z-10
          transition-all duration-1000 ease-out
          ${visible ? 'opacity-100' : 'opacity-0'}
        `}
      >
        <div className="text-center px-4">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 drop-shadow-lg">
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, var(--theme-primary), var(--theme-accent))' }}>
              Ready to Transform Your Note-Taking?
            </span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto drop-shadow" style={{ color: 'var(--theme-light)' }}>
            Join thousands of users who have already discovered the power of AI-enhanced notebooks.
          </p>
        </div>
      </div>
    </section>
  )
}
