import { useEffect } from "react"
import { ScrollTrigger } from "gsap/ScrollTrigger"

import HeroSection from "@/components/HeroSection"
import { fadeUpOnScroll } from "@/utils/animations"

function Home() {
  useEffect(() => {
    fadeUpOnScroll(".section-heading")

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  return (
    <>
      <HeroSection />
    </>
  )
}

export default Home
