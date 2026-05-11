import { lazy, Suspense, useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { gsap } from "gsap"

import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

const HeroBackground = lazy(() => import("@/components/HeroBackground"))

export default function HeroSection() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const formCardRef = useRef(null)
  const buttonRef = useRef(null)
  const [batchCode, setBatchCode] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (!formCardRef.current) return
    gsap.fromTo(
      formCardRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", delay: 0.05 },
    )
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = batchCode.trim()
    if (!trimmed || trimmed.length < 3) {
      setError("Please enter a valid batch number (min 3 characters)")
      return
    }
    setError("")

    if (formCardRef.current) {
      gsap.to(formCardRef.current, { y: -6, scale: 0.985, duration: 0.2, ease: "power2.out" })
    }

    toast({ title: "Verifying...", description: "Looking up your batch number.", variant: "default" })

    const encoded = btoa(JSON.stringify({ b: trimmed }))
    setTimeout(() => navigate(`/verify?ref=${encodeURIComponent(encoded)}`), 300)
  }

  const handleButtonHover = () => {
    if (!buttonRef.current) return
    gsap.to(buttonRef.current, { y: -1, scale: 1.005, duration: 0.15, ease: "power2.out" })
  }

  const handleButtonLeave = () => {
    if (!buttonRef.current) return
    gsap.to(buttonRef.current, { y: 0, scale: 1, duration: 0.15, ease: "power2.out" })
  }

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-[linear-gradient(180deg,rgba(234,246,244,0.92),rgba(246,251,250,0.97))]"
    >
      <Suspense fallback={null}>
        <HeroBackground count={85} opacity={0.75} size={0.05} className="pointer-events-none absolute inset-0 z-[1]" />
      </Suspense>
      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-6 px-4 py-8 sm:gap-8 sm:px-6 sm:py-14 lg:grid-cols-2 lg:px-8 lg:py-20">
        {/* Hero copy */}
        <div className="space-y-4 sm:space-y-5">
          <Badge className="rounded-full border border-[#E8ECE8] bg-[#F7F8F5] px-4 py-2 text-xs text-[#3EBF6A]">
            ✦ Verify Your Product · Batch Authentication
          </Badge>
          <h1 className="space-y-1 text-4xl font-black leading-[0.95] text-[#111111] sm:text-6xl lg:text-7xl">
            <span className="fade-up block [animation-delay:160ms]">Your Batch.</span>
            <span className="fade-up block [animation-delay:300ms]">Verified.</span>
            <span className="fade-up block [animation-delay:420ms]">Instantly.</span>
          </h1>
          <p className="max-w-xl text-sm text-[#4f4f4f] sm:text-lg">
            Enter the batch number printed on your product packaging to verify its authenticity.
          </p>
        </div>

        {/* Batch input card */}
        <div className="relative w-full rounded-3xl border border-[#E8ECE8] bg-[#F7F8F5] p-3 sm:p-6">
          <form
            ref={formCardRef}
            onSubmit={handleSubmit}
            className="relative z-10 rounded-2xl border border-[#E8ECE8] bg-white p-3.5 sm:p-5"
          >
            <label className="block text-sm font-medium text-[#111111]">
              Batch Number
              <input
                type="text"
                value={batchCode}
                onChange={(e) => { setBatchCode(e.target.value); setError("") }}
                placeholder="e.g. 022503000001"
                className="mt-2 w-full rounded-xl border border-[#E8ECE8] px-4 py-3 text-[#111111] outline-none focus:border-[var(--green)] transition-colors"
              />
              {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
            </label>
            <button
              type="submit"
              onMouseEnter={handleButtonHover}
              onMouseLeave={handleButtonLeave}
              ref={buttonRef}
              className="mt-4 w-full rounded-xl bg-[var(--green)] py-3 font-bold text-white transition hover:opacity-90"
            >
              Verify Batch →
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
