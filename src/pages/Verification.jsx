import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

import CTASection from "@/components/CTASection"
import CoachSection from "@/components/CoachSection"
import DiscountSection from "@/components/DiscountSection"
import HeroBackground from "@/components/HeroBackground"
import { useVerificationStore } from "@/lib/verification-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { fadeUpOnScroll } from "@/utils/animations"

const DUMMY_COA = {
  productName: "Trial Product",
  labName: "Business Central ERP",
  reportDate: "2024-11-07",
  status: "Approved",
  packId: "VSR000000001",
  testParameters: [
    { label: "Purity", value: "99.2%" },
    { label: "Heavy Metals", value: "< 5 ppm" },
    { label: "Moisture", value: "0.3%" },
    { label: "pH Value", value: "7.2" },
    { label: "Microbial Count", value: "< 100 CFU/g" },
  ],
}

const METRIC_TARGETS = {
  purity: 99.2,
  heavyMetals: 5,
  moisture: 0.3,
  ph: 7.2,
  microbial: 100,
}

const INGREDIENT_TARGETS = {
  botanicalBlend: 68,
  activeCompound: 24,
  bioavailability: 93,
}

function getFallbackBatch(serial) {
  const cleaned = serial.replace(/[^A-Za-z0-9]/g, "").toUpperCase()
  const suffix = cleaned.slice(-5) || "00000"
  return `BATCH-${suffix}`
}

export default function Verification() {
  const [searchParams] = useSearchParams()
  const {
    serialNumber: storedSerial,
    batchId: storedBatch,
    setSerialAndBatch,
    setOtpVerified,
    setEmailVerified,
    otpVerified,
    emailVerified,
  } = useVerificationStore()

  const [batchId, setBatchId] = useState("[BATCH-XXXXX]")
  const [serialNumber, setSerialNumber] = useState("[SN-XXXXXXXX]")
  const [mobile, setMobile] = useState("")
  const [otp, setOtp] = useState("")
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [otpError, setOtpError] = useState("")
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [email, setEmail] = useState("")
  const [emailSent, setEmailSent] = useState(emailVerified)
  const [offerUnlocked, setOfferUnlocked] = useState(false)
  const [emailError, setEmailError] = useState("")
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [metricValues, setMetricValues] = useState({
    purity: 0,
    heavyMetals: 0,
    moisture: 0,
    ph: 0,
    microbial: 0,
  })
  const [ingredientValues, setIngredientValues] = useState({
    botanicalBlend: 0,
    activeCompound: 0,
    bioavailability: 0,
  })

  const coaSectionRef = useRef(null)
  const lockOverlayRef = useRef(null)

  useEffect(() => {
    if (storedSerial) setSerialNumber(storedSerial)
    if (storedBatch) setBatchId(storedBatch)
    const encoded = searchParams.get("ref") || ""
    if (!encoded) return
    try {
      const decoded = JSON.parse(atob(decodeURIComponent(encoded)))
      const nextSerial = decoded?.s || storedSerial
      const nextBatch = decoded?.b || (decoded?.s ? getFallbackBatch(decoded.s) : storedBatch)
      if (nextSerial) setSerialNumber(nextSerial)
      if (nextBatch) setBatchId(nextBatch)
      if (nextSerial || nextBatch) setSerialAndBatch(nextSerial || serialNumber, nextBatch || batchId)
    } catch {
      // Invalid ref payload, keep placeholders.
    }
  }, [searchParams, setSerialAndBatch, storedBatch, storedSerial])

  useEffect(() => {
    fadeUpOnScroll(".verify-heading")
    fadeUpOnScroll(".verify-card", { stagger: 0.08 })
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  useEffect(() => {
    if (otpVerified) setIsUnlocked(true)
  }, [otpVerified])

  useEffect(() => {
    if (!isUnlocked || !coaSectionRef.current) return

    setMetricValues({
      purity: 0,
      heavyMetals: 0,
      moisture: 0,
      ph: 0,
      microbial: 0,
    })
    setIngredientValues({
      botanicalBlend: 0,
      activeCompound: 0,
      bioavailability: 0,
    })

    const revealTimeline = gsap.timeline()
    revealTimeline.fromTo(
      ".coa-reveal",
      { opacity: 0, y: 26, scale: 0.985 },
      { opacity: 1, y: 0, scale: 1, duration: 0.52, ease: "power3.out", stagger: 0.07 },
    )

    const counters = {
      purity: 0,
      heavyMetals: 0,
      moisture: 0,
      ph: 0,
      microbial: 0,
    }

    gsap.to(counters, {
      purity: METRIC_TARGETS.purity,
      heavyMetals: METRIC_TARGETS.heavyMetals,
      moisture: METRIC_TARGETS.moisture,
      ph: METRIC_TARGETS.ph,
      microbial: METRIC_TARGETS.microbial,
      delay: 0.15,
      duration: 1.55,
      ease: "power2.out",
      onUpdate: () => {
        setMetricValues({
          purity: Number(counters.purity.toFixed(1)),
          heavyMetals: Number(counters.heavyMetals.toFixed(0)),
          moisture: Number(counters.moisture.toFixed(1)),
          ph: Number(counters.ph.toFixed(1)),
          microbial: Number(counters.microbial.toFixed(0)),
        })
      },
    })

    const ingredientCounters = {
      botanicalBlend: 0,
      activeCompound: 0,
      bioavailability: 0,
    }
    gsap.to(ingredientCounters, {
      botanicalBlend: INGREDIENT_TARGETS.botanicalBlend,
      activeCompound: INGREDIENT_TARGETS.activeCompound,
      bioavailability: INGREDIENT_TARGETS.bioavailability,
      delay: 0.25,
      duration: 1.2,
      ease: "power2.out",
      onUpdate: () => {
        setIngredientValues({
          botanicalBlend: Number(ingredientCounters.botanicalBlend.toFixed(0)),
          activeCompound: Number(ingredientCounters.activeCompound.toFixed(0)),
          bioavailability: Number(ingredientCounters.bioavailability.toFixed(0)),
        })
      },
    })
    gsap.fromTo(
      ".ingredient-fill",
      { width: "0%" },
      { width: (_, target) => target.getAttribute("data-width"), duration: 1.05, ease: "power2.out", stagger: 0.09 },
    )
  }, [isUnlocked])

  const sendOtp = () => {
    if (mobile.replace(/\D/g, "").length < 10) {
      setOtpError("Enter a valid mobile number.")
      return
    }
    setOtpError("")
    setIsSendingOtp(true)
    // TODO: POST /api/otp/send with { mobile, serialNumber, batchId }
    window.setTimeout(() => {
      setIsSendingOtp(false)
      setIsOtpSent(true)
    }, 900)
  }

  const verifyOtp = () => {
    if (otp !== "123456") {
      setOtpError("Invalid OTP. Please try again.")
      return
    }
    setOtpError("")
    if (lockOverlayRef.current) {
      gsap.timeline().to(lockOverlayRef.current, {
        opacity: 0,
        scale: 1.04,
        duration: 0.45,
        ease: "power2.out",
        onComplete: () => setIsUnlocked(true),
      })
    } else {
      setIsUnlocked(true)
    }
    setOtpVerified(true)
  }

  const sendEmailCertificate = () => {
    if (!email.trim().includes("@")) {
      setEmailError("Enter a valid email address.")
      return
    }
    setEmailError("")
    setIsSendingEmail(true)
    // TODO: POST /api/coa/email with { email, batchId, serialNumber }
    window.setTimeout(() => {
      setIsSendingEmail(false)
      setEmailSent(true)
      setEmailVerified(true)
      setShowEmailModal(false)
    }, 900)
  }

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,rgba(234,246,244,0.94),rgba(246,251,250,0.96))] px-4 pb-14 pt-28 sm:px-6 lg:px-8">
      <HeroBackground count={130} opacity={0.75} size={0.05} className="pointer-events-none absolute inset-0 z-0" />
      <div className="relative z-10 mx-auto max-w-6xl space-y-6">
        {/* SECTION: PAGE HEADER */}
        <header className="verify-heading text-center">
          <h1 className="text-4xl font-black text-[#111111] sm:text-5xl">Verify Your Product</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">Authenticity • Transparency • Trust</p>
          <p className="mt-2 text-sm text-[var(--green)]">Your authenticity is now verified ✅</p>
        </header>

        {/* SECTION: PRODUCT INFO */}
        <article className="verify-card rounded-2xl border border-[#D9E2DE] bg-white/88 p-5 backdrop-blur-[1px] sm:p-8">
          <div className="mb-4 flex items-center gap-2">
            <h2 className="text-2xl font-bold text-[#111111]">Product Information</h2>
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#eaf8ef] text-xs text-[var(--green)]">✓</span>
          </div>
          <div className="space-y-3 border-t border-[#E8ECE8] pt-4 text-sm">
            <div className="flex items-center justify-between gap-4 border-b border-[#E8ECE8] pb-2">
              <span className="text-[var(--muted)]">Product Name</span>
              <span className="font-medium text-[#111111]">{DUMMY_COA.productName}</span>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-[#E8ECE8] pb-2">
              <span className="text-[var(--muted)]">Batch Code</span>
              <span className="font-medium text-[#111111]">{batchId}</span>
            </div>
            <div className="flex items-center justify-between gap-4 pb-1">
              <span className="text-[var(--muted)]">Pack ID / Serial</span>
              <span className="font-medium text-[#111111]">{serialNumber}</span>
            </div>
            <div className="rounded-xl border border-[#CFECD8] bg-[#ECFAF1] px-4 py-2 text-[var(--green)]">
              ✅ Authentic product - verified
              {/* DYNAMIC: status text from verification API */}
            </div>
          </div>
        </article>

        {/* SECTION: OTP GATE (ABOVE BLURRED COA) */}
        <article className="verify-card rounded-2xl border border-[#D9E2DE] bg-white/88 p-5 backdrop-blur-[1px] sm:p-6">
          <h3 className="text-xl font-bold text-[#111111]">Identity Check</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">Enter mobile number and OTP to unlock full CoA metrics.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="text-sm font-medium text-[#111111]">
              Mobile Number
              <Input value={mobile} onChange={(event) => setMobile(event.target.value)} type="tel" placeholder="+91 XXXXX XXXXX" className="mt-2 border-[#E8ECE8] bg-white text-[#111111]" />
            </label>
            <Button type="button" onClick={sendOtp} className="bg-[var(--green)] text-white hover:bg-[var(--green)]/90">
              {isSendingOtp ? "Sending..." : "Send OTP"}
            </Button>
          </div>

          {isOtpSent && (
            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
              <label className="text-sm font-medium text-[#111111]">
                Enter OTP
                <Input value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} type="text" placeholder="123456" className="mt-2 border-[#E8ECE8] bg-white text-[#111111] tracking-[0.25em]" />
              </label>
              <Button type="button" onClick={verifyOtp} className="bg-[var(--green)] text-white hover:bg-[var(--green)]/90">
                Verify OTP
              </Button>
            </div>
          )}
          {otpError && <p className="mt-3 text-xs text-red-500">{otpError}</p>}
        </article>

        {/* SECTION: COA METRICS (LOCKED UNTIL OTP) */}
        <article ref={coaSectionRef} className="verify-card relative overflow-hidden rounded-2xl border border-[#D9E2DE] bg-white/90 p-5 backdrop-blur-[1px] sm:p-6">
          {!isUnlocked && (
            <div ref={lockOverlayRef} className="absolute inset-0 z-10 flex items-center justify-center bg-white/65 backdrop-blur-sm">
              <div className="space-y-2 text-center">
                <p className="rounded-full border border-[#E8ECE8] bg-white px-4 py-2 text-sm text-[#111111]">Enter OTP to unlock CoA details</p>
                <p className="text-xs text-[var(--muted)]">Metrics will reveal instantly after verification.</p>
              </div>
            </div>
          )}

          <div className="coa-reveal flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-3xl font-black text-[#111111]">Certificate of Analysis (via Business Central)</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">Quality test results from Business Central ERP</p>
            </div>
            <span className="rounded-full bg-[#11b5b2] px-3 py-1 text-xs font-semibold text-white">{DUMMY_COA.status}</span>
          </div>

          <div className="coa-reveal mt-4 flex items-center justify-between border-b border-[#E8ECE8] pb-3 text-sm">
            <span className="text-[var(--muted)]">Report Date</span>
            <span className="font-medium text-[#111111]">{DUMMY_COA.reportDate}</span>
          </div>

          <h4 className="coa-reveal mt-4 text-xl font-bold text-[#111111]">Test Parameters</h4>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="coa-reveal rounded-xl border border-[#E8ECE8] bg-[#F7F8F5] px-4 py-3">
              <p className="text-sm text-[var(--muted)]">Purity</p>
              <p className="text-2xl font-bold text-[#111111]">{metricValues.purity}%</p>
            </div>
            <div className="coa-reveal rounded-xl border border-[#E8ECE8] bg-[#F7F8F5] px-4 py-3">
              <p className="text-sm text-[var(--muted)]">Heavy Metals</p>
              <p className="text-2xl font-bold text-[#111111]">{`< ${metricValues.heavyMetals} ppm`}</p>
            </div>
            <div className="coa-reveal rounded-xl border border-[#E8ECE8] bg-[#F7F8F5] px-4 py-3">
              <p className="text-sm text-[var(--muted)]">Moisture</p>
              <p className="text-2xl font-bold text-[#111111]">{metricValues.moisture}%</p>
            </div>
            <div className="coa-reveal rounded-xl border border-[#E8ECE8] bg-[#F7F8F5] px-4 py-3">
              <p className="text-sm text-[var(--muted)]">pH Value</p>
              <p className="text-2xl font-bold text-[#111111]">{metricValues.ph}</p>
            </div>
            <div className="coa-reveal rounded-xl border border-[#E8ECE8] bg-[#F7F8F5] px-4 py-3 sm:col-span-2">
              <p className="text-sm text-[var(--muted)]">Microbial Count</p>
              <p className="text-2xl font-bold text-[#111111]">{`< ${metricValues.microbial} CFU/g`}</p>
            </div>
          </div>

          <div className="coa-reveal mt-4 rounded-xl border border-[#CFECD8] bg-[#ECFAF1] px-4 py-3 text-[#21543a]">
            <p className="text-sm text-[var(--muted)]">Conclusion</p>
            <p className="text-lg font-medium">All parameters within specifications. Batch approved for release.</p>
          </div>

          <div className="coa-reveal mt-4 rounded-2xl border border-[#D9E2DE] bg-[#F7F8F5] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-lg font-bold text-[#111111]">Ingredient Composition Snapshot</h4>
              <span className="rounded-full bg-[#EAF8EF] px-3 py-1 text-xs font-semibold text-[var(--green)]">Batch Profile</span>
            </div>
            <p className="mt-1 text-sm text-[var(--muted)]">Interactive preview of this batch profile before full report download.</p>
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-[#E8ECE8] bg-white px-3 py-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-[#111111]">Botanical Blend</span>
                  <span className="font-bold text-[#11b5b2]">{ingredientValues.botanicalBlend}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-[#E8ECE8]">
                  <div className="ingredient-fill h-2 rounded-full bg-[#11b5b2]" data-width="68%" />
                </div>
              </div>
              <div className="rounded-xl border border-[#E8ECE8] bg-white px-3 py-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-[#111111]">Active Compound</span>
                  <span className="font-bold text-[#11b5b2]">{ingredientValues.activeCompound}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-[#E8ECE8]">
                  <div className="ingredient-fill h-2 rounded-full bg-[#11b5b2]" data-width="24%" />
                </div>
              </div>
              <div className="rounded-xl border border-[#E8ECE8] bg-white px-3 py-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-[#111111]">Bioavailability Score</span>
                  <span className="font-bold text-[#11b5b2]">{ingredientValues.bioavailability}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-[#E8ECE8]">
                  <div className="ingredient-fill h-2 rounded-full bg-[#11b5b2]" data-width="93%" />
                </div>
              </div>
            </div>
          </div>

          {isUnlocked && (
            <div className="coa-reveal mt-4 space-y-3">
              <Button type="button" onClick={() => setShowEmailModal(true)} className="w-full bg-[#11b5b2] text-white hover:bg-[#11b5b2]/90">
                📧 Email Full CoA PDF
              </Button>
              {emailSent && <p className="text-sm text-[#11b5b2]">Certificate sent to your email.</p>}
            </div>
          )}
        </article>

        {/* SECTION: COACH (UNLOCKED AFTER OTP) */}
        {isUnlocked && <CoachSection />}

        {/* SECTION: DISCOUNT (GIFT-BOX UNWRAP + CODE REVEAL) */}
        {isUnlocked && emailSent && <DiscountSection onReveal={() => setOfferUnlocked(true)} />}

        {/* SECTION: SHOP CTA (REVEALED AFTER GIFT TAP) */}
        {isUnlocked && emailSent && offerUnlocked && <CTASection />}
      </div>

      {showEmailModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#D9E2DE] bg-white p-5 shadow-2xl">
            <h4 className="text-2xl font-bold text-[#111111]">Send CoA to Email</h4>
            <p className="mt-1 text-sm text-[var(--muted)]">We&apos;ll send the full certificate PDF to your inbox.</p>
            <label className="mt-4 block text-sm font-medium text-[#111111]">
              Email Address
              <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="Enter your email" className="mt-2 border-[#E8ECE8] bg-white text-[#111111]" />
            </label>
            {emailError && <p className="mt-2 text-xs text-red-500">{emailError}</p>}
            <div className="mt-4 flex gap-2">
              <Button type="button" variant="outline" onClick={() => setShowEmailModal(false)} className="border-[#D9E2DE] bg-white text-[#111111]">
                Cancel
              </Button>
              <Button type="button" onClick={sendEmailCertificate} className="bg-[#11b5b2] text-white hover:bg-[#11b5b2]/90">
                {isSendingEmail ? "Sending..." : "Send Certificate"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
