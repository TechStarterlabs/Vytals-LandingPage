import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function fadeUpOnScroll(selector, options = {}) {
  gsap.fromTo(
    selector,
    { opacity: 0, y: 40 },
    {
      opacity: 1,
      y: 0,
      duration: options.duration || 0.7,
      ease: "power3.out",
      stagger: options.stagger || 0.12,
      scrollTrigger: {
        trigger: selector,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    },
  )
}

export function scaleInOnScroll(selector) {
  gsap.fromTo(
    selector,
    { opacity: 0, scale: 0.92 },
    {
      opacity: 1,
      scale: 1,
      duration: 0.6,
      ease: "back.out(1.4)",
      scrollTrigger: {
        trigger: selector,
        start: "top 88%",
        toggleActions: "play none none none",
      },
    },
  )
}
