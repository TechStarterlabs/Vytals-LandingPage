import { lazy, Suspense } from "react"

import HeroSection from "@/components/HeroSection"

const CTASection = lazy(() => import("@/components/CTASection"))

function Home() {
  return (
    <>
      <HeroSection />
      <Suspense fallback={<div className="h-48" />}>
        <CTASection fullBleed />
      </Suspense>
    </>
  )
}

export default Home
