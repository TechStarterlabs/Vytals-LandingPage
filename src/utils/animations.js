import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

// Optimized fade up animation with reduced complexity
export function fadeUpOnScroll(selector, options = {}) {
  gsap.fromTo(
    selector,
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: options.duration || 0.5,
      ease: "power2.out",
      stagger: options.stagger || 0.08,
      scrollTrigger: {
        trigger: selector,
        start: "top 90%",
        toggleActions: "play none none none",
        once: true, // Only animate once
      },
    },
  )
}

// Optimized scale animation
export function scaleInOnScroll(selector) {
  gsap.fromTo(
    selector,
    { opacity: 0, scale: 0.95 },
    {
      opacity: 1,
      scale: 1,
      duration: 0.4,
      ease: "power2.out",
      scrollTrigger: {
        trigger: selector,
        start: "top 90%",
        toggleActions: "play none none none",
        once: true,
      },
    },
  )
}

