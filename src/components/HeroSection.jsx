import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { gsap } from "gsap"

import HeroBackground from "@/components/HeroBackground"
import { useVerificationStore } from "@/lib/verification-store"
import { Badge } from "@/components/ui/badge"

function deriveBatchId(serialNumber) {
  const cleaned = serialNumber.replace(/[^A-Za-z0-9]/g, "").toUpperCase()
  const suffix = cleaned.slice(-5) || "00000"
  return `BATCH-${suffix}`
}

export default function HeroSection() {
  const navigate = useNavigate()
  const { setHomeCompleted, setSerialAndBatch } = useVerificationStore()
  const formCardRef = useRef(null)
  const buttonRef = useRef(null)

  const [serialNumber, setSerialNumber] = useState("")
  const [serialError, setSerialError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleContinue = () => {
    if (!serialNumber.trim() || !formCardRef.current) {
      setSerialError("Serial number is required.")
      return
    }
    setSerialError("")
    setIsLoading(true)

    const normalizedSerial = serialNumber.trim().toUpperCase()
    const batchId = deriveBatchId(normalizedSerial)
    const encoded = btoa(JSON.stringify({ s: normalizedSerial, b: batchId }))
    setSerialAndBatch(normalizedSerial, batchId)
    setHomeCompleted(true)

    gsap.to(formCardRef.current, { y: -6, scale: 0.985, duration: 0.2, ease: "power2.out" })
    window.setTimeout(() => navigate(`/verify?ref=${encodeURIComponent(encoded)}`), 550)
  }

  const handleSerialFocus = () => {
    if (!formCardRef.current) return
    gsap.to(formCardRef.current, {
      boxShadow: "0 16px 45px rgba(17, 181, 178, 0.18)",
      borderColor: "rgba(17, 181, 178, 0.45)",
      duration: 0.25,
      ease: "power2.out",
    })
  }

  const handleSerialBlur = () => {
    if (!formCardRef.current) return
    gsap.to(formCardRef.current, {
      boxShadow: "0 0 0 rgba(0,0,0,0)",
      borderColor: "#E8ECE8",
      duration: 0.3,
      ease: "power2.out",
    })
  }

  const handleButtonHover = () => {
    if (!buttonRef.current) return
    gsap.to(buttonRef.current, { y: -2, scale: 1.01, duration: 0.2, ease: "power2.out" })
  }

  const handleButtonLeave = () => {
    if (!buttonRef.current) return
    gsap.to(buttonRef.current, { y: 0, scale: 1, duration: 0.2, ease: "power2.out" })
  }

  useEffect(() => {
    if (!formCardRef.current) return
    gsap.fromTo(
      formCardRef.current,
      { opacity: 0, y: 30, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: "power3.out", delay: 0.08 },
    )
    const floatTween = gsap.to(formCardRef.current, { y: -3, duration: 2.3, yoyo: true, repeat: -1, ease: "sine.inOut" })
    return () => floatTween.kill()
  }, [])

  return (
    <section
      id="home"
      className="relative h-[calc(100vh-5rem)] overflow-hidden bg-[linear-gradient(180deg,rgba(234,246,244,0.92),rgba(246,251,250,0.97))]"
    >
      <HeroBackground count={180} opacity={0.9} size={0.055} className="pointer-events-none absolute inset-0 z-[1]" />
      <div className="relative z-10 mx-auto grid h-full max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        {/* HOME HERO SECTION */}
        <div className="space-y-5">
          <Badge className="rounded-full border border-[#E8ECE8] bg-[#F7F8F5] px-4 py-2 text-xs text-[#3EBF6A]">
            ✦ Verify Your Product · Serial Authentication
          </Badge>
          <h1 className="space-y-1 text-5xl font-black leading-[0.95] text-[#111111] sm:text-7xl">
            <span className="fade-up block [animation-delay:160ms]">Your Product.</span>
            <span className="fade-up block [animation-delay:300ms]">Verified.</span>
            <span className="fade-up block [animation-delay:420ms]">Instantly.</span>
          </h1>
          <p className="max-w-xl text-base text-[#4f4f4f] sm:text-lg">
            Enter your product&apos;s serial number to continue verification.
          </p>

        </div>

        {/* SERIAL INPUT SECTION */}
        <div className="relative overflow-hidden rounded-3xl border border-[#E8ECE8] bg-[#F7F8F5] p-4 sm:p-6">
          <div ref={formCardRef} className="relative z-10 rounded-2xl border border-[#E8ECE8] bg-white p-4 sm:p-5">
            <label className="block text-sm font-medium text-[#111111]">
              Serial Number
              <input
                value={serialNumber}
                onChange={(event) => setSerialNumber(event.target.value)}
                onFocus={handleSerialFocus}
                onBlur={handleSerialBlur}
                type="text"
                placeholder="e.g. SN-XXXXXXXX"
                className="mt-2 w-full rounded-xl border border-[#E8ECE8] px-4 py-3 text-[#111111] outline-none focus:border-[var(--green)]"
              />
              {serialError && <span className="mt-1 block text-xs text-red-500">{serialError}</span>}
            </label>
            <button
              type="button"
              onClick={handleContinue}
              disabled={isLoading}
              onMouseEnter={handleButtonHover}
              onMouseLeave={handleButtonLeave}
              ref={buttonRef}
              className="mt-4 w-full rounded-xl bg-[var(--green)] py-3 font-bold text-white transition hover:opacity-90 disabled:opacity-70"
            >
              {isLoading ? "Continuing..." : "Continue to Verification →"}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
