import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

/**
 * SectionTransition
 * Wraps top-level website sections / divs to create high-end Framer/Nomina-style
 * curtain stacking transitions between major sections as the user scrolls.
 *
 * Each successive section slides over the previous one with depth scaling,
 * elevation shadow, and smooth Lenis-driven inertial gliding.
 */
export default function SectionTransition({
  children,
  zIndex = 1,
  className = '',
  id,
  style = {},
  isSticky = false,
  enableExitDepth = true,
  bg = '#050505',
}) {
  const containerRef = useRef(null)

  // Track scroll from when the section is at top of viewport to when its bottom hits top
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  // Subtle depth exit: scale down and dim as the next section curtains over it
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.95])
  const opacity = useTransform(scrollYProgress, [0, 0.7, 1], [1, 0.92, 0.55])
  const y = useTransform(scrollYProgress, [0, 1], [0, 40])

  return (
    <div
      ref={containerRef}
      id={id}
      className={`section-curtain-wrap ${className}`}
      style={{
        position: isSticky ? 'sticky' : 'relative',
        top: isSticky ? 0 : undefined,
        zIndex,
        backgroundColor: bg,
        // Curtain drop shadow over previous section
        boxShadow: zIndex > 1 ? '0 -35px 70px -10px rgba(0, 0, 0, 0.98)' : 'none',
        borderTop: zIndex > 1 ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
        ...style,
      }}
    >
      <motion.div
        style={enableExitDepth ? { scale, opacity, y, originY: 0 } : {}}
        className="section-curtain-inner"
      >
        {children}
      </motion.div>
    </div>
  )
}
