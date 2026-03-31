import { lazy, Suspense, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { gsap } from "gsap"

import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

const HeroBackground = lazy(() => import("@/components/HeroBackground"))
const CTASection = lazy(() => import("@/components/CTASection"))

export default function ProductHome() {
  const { productSlug } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const formCardRef = useRef(null)
  const buttonRef = useRef(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { batchCode: "" },
  })

  const onSubmit = (data) => {
    const batchCode = data.batchCode.trim().toUpperCase()
    const encoded = btoa(JSON.stringify({ b: batchCode }))

    if (formCardRef.current) {
      gsap.to(formCardRef.current, { y: -6, scale: 0.985, duration: 0.2, ease: "power2.out" })
    }

    toast({
      title: "Verifying...",
      description: "Looking up your batch number.",
      variant: "default",
    })

    setTimeout(() => {
      navigate(`/${productSlug}/verify?ref=${encodeURIComponent(encoded)}`)
    }, 350)
  }

  const handleInputFocus = () => {
    if (!formCardRef.current) return
    gsap.to(formCardRef.current, {
      boxShadow: "0 12px 35px rgba(17, 181, 178, 0.15)",
      borderColor: "rgba(17, 181, 178, 0.4)",
      duration: 0.2,
      ease: "power2.out",
    })
  }

  const handleInputBlur = () => {
    if (!formCardRef.current) return
    gsap.to(formCardRef.current, {
      boxShadow: "0 0 0 rgba(0,0,0,0)",
      borderColor: "#E8ECE8",
      duration: 0.2,
      ease: "power2.out",
    })
  }

  const handleButtonHover = () => {
    if (!buttonRef.current) return
    gsap.to(buttonRef.current, { y: -1, scale: 1.005, duration: 0.15, ease: "power2.out" })
  }

  const handleButtonLeave = () => {
    if (!buttonRef.current) return
    gsap.to(buttonRef.current, { y: 0, scale: 1, duration: 0.15, ease: "power2.out" })
  }

  useEffect(() => {
    if (!formCardRef.current) return
    gsap.fromTo(
      formCardRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", delay: 0.05 },
    )
  }, [])

  return (
    <>
      <section
        id="product-home"
        className="relative overflow-hidden bg-[linear-gradient(180deg,rgba(234,246,244,0.92),rgba(246,251,250,0.97))]"
      >
        <Suspense fallback={null}>
          <HeroBackground count={85} opacity={0.75} size={0.05} className="pointer-events-none absolute inset-0 z-[1]" />
        </Suspense>
        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-6 px-4 py-8 sm:gap-8 sm:px-6 sm:py-14 lg:grid-cols-2 lg:px-8 lg:py-20">
          {/* HERO TEXT */}
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

          {/* BATCH INPUT FORM */}
          <div className="relative w-full rounded-3xl border border-[#E8ECE8] bg-[#F7F8F5] p-3 sm:p-6">
            <form onSubmit={handleSubmit(onSubmit)} ref={formCardRef} className="relative z-10 rounded-2xl border border-[#E8ECE8] bg-white p-3.5 sm:p-5">
              <label className="block text-sm font-medium text-[#111111]">
                Batch Number
                <input
                  {...register("batchCode", {
                    required: "Batch number is required",
                    minLength: {
                      value: 3,
                      message: "Batch number must be at least 3 characters",
                    },
                  })}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  type="text"
                  placeholder="e.g. BATCH-00001"
                  className="mt-2 w-full rounded-xl border border-[#E8ECE8] px-4 py-3 text-[#111111] outline-none focus:border-[var(--green)]"
                  disabled={isSubmitting}
                />
                {errors.batchCode && (
                  <span className="mt-1 block text-xs text-red-500">{errors.batchCode.message}</span>
                )}
              </label>
              <button
                type="submit"
                disabled={isSubmitting}
                onMouseEnter={handleButtonHover}
                onMouseLeave={handleButtonLeave}
                ref={buttonRef}
                className="mt-4 w-full rounded-xl bg-[var(--green)] py-3 font-bold text-white transition hover:opacity-90 disabled:opacity-70"
              >
                {isSubmitting ? "Verifying..." : "Continue to Verification →"}
              </button>
            </form>
          </div>
        </div>
      </section>

      <Suspense fallback={<div className="h-48" />}>
        <CTASection fullBleed />
      </Suspense>
    </>
  )
}
