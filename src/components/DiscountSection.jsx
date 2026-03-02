import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { Copy } from "lucide-react"

import { Button } from "@/components/ui/button"

function DiscountSection({ onReveal }) {
  const [copied, setCopied] = useState(false)
  const [isGiftOpened, setIsGiftOpened] = useState(false)
  // DYNAMIC: replace hardcoded discount code with value from Shopify verification response
  const discountCode = "SPUNGE30"
  const revealCardRef = useRef(null)
  const giftWrapRef = useRef(null)
  const giftLidRef = useRef(null)
  const giftBodyRef = useRef(null)
  const sparklesRef = useRef(null)

  useEffect(() => {
    if (!copied) return undefined
    const timer = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(timer)
  }, [copied])

  const copyCode = async () => {
    await navigator.clipboard.writeText(discountCode)
    setCopied(true)
  }

  useEffect(() => {
    if (!isGiftOpened || !revealCardRef.current) return
    gsap.fromTo(
      revealCardRef.current,
      { y: 24, opacity: 0, scale: 0.98 },
      { y: 0, opacity: 1, scale: 1, duration: 0.48, ease: "power3.out" },
    )
  }, [isGiftOpened])

  const openGift = () => {
    if (!giftWrapRef.current || !giftLidRef.current || !giftBodyRef.current || isGiftOpened) return

    const timeline = gsap.timeline({
      onComplete: () => {
        setIsGiftOpened(true)
        onReveal?.()
      },
    })

    timeline
      .to(giftLidRef.current, { y: -34, rotate: -12, duration: 0.28, ease: "power2.out" })
      .to(giftBodyRef.current, { y: 6, scale: 0.97, duration: 0.16, ease: "power2.inOut" }, "<")
      .to(giftBodyRef.current, { y: -8, scale: 1.03, duration: 0.2, ease: "power2.out" })
      .to(giftWrapRef.current, { scale: 0.86, opacity: 0, duration: 0.24, ease: "power2.in" })

    if (sparklesRef.current) {
      const particles = sparklesRef.current.querySelectorAll(".gift-spark")
      gsap.fromTo(
        particles,
        { opacity: 0, y: 0, scale: 0.4 },
        { opacity: 1, y: -26, scale: 1, stagger: 0.06, duration: 0.34, ease: "power2.out" },
      )
      gsap.to(particles, { opacity: 0, y: -40, duration: 0.26, delay: 0.32, stagger: 0.04, ease: "power1.in" })
    }
  }

  return (
    <section
      id="discount"
      className="relative overflow-hidden bg-[linear-gradient(rgba(234,246,244,0.94),rgba(234,246,244,0.94)),url('https://cdn.shopify.com/s/files/1/0724/4831/1464/files/Rectangle_8990_1.png?v=1762853209')] py-20"
    >
      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
        <h2 className="section-heading text-3xl font-bold sm:text-5xl">You&apos;ve Unlocked an Exclusive Offer</h2>
        <p className="mx-auto mt-4 max-w-2xl text-[var(--muted)]">
          Valid for 30 days from your scan date. One use only.
        </p>

        {!isGiftOpened && (
          <div className="mt-8 flex flex-col items-center">
            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-[#888888]">Tap gift box to reveal code</p>
            <button type="button" onClick={openGift} className="relative rounded-2xl p-2" aria-label="Open gift box">
              <span ref={sparklesRef} className="pointer-events-none absolute inset-0">
                <span className="gift-spark absolute left-[28%] top-[38%] text-base">✨</span>
                <span className="gift-spark absolute left-[64%] top-[34%] text-sm">✨</span>
                <span className="gift-spark absolute left-[48%] top-[26%] text-lg">✨</span>
              </span>
              <span ref={giftWrapRef} className="relative block h-36 w-36">
                <span ref={giftLidRef} className="absolute left-2 right-2 top-3 h-9 rounded-md bg-[#19cbc5] shadow-[0_10px_20px_rgba(17,181,178,0.25)]">
                  <span className="absolute left-1/2 top-0 h-full w-4 -translate-x-1/2 bg-[#0ea7a3]" />
                </span>
                <span ref={giftBodyRef} className="absolute inset-x-0 bottom-2 top-10 rounded-lg bg-[#11b5b2] shadow-[0_14px_26px_rgba(17,181,178,0.35)]">
                  <span className="absolute left-1/2 top-0 h-full w-4 -translate-x-1/2 bg-[#0d9d99]" />
                  <span className="absolute inset-x-0 top-1/2 h-4 -translate-y-1/2 bg-[#0d9d99]" />
                </span>
              </span>
            </button>
          </div>
        )}

        {isGiftOpened && (
          <div ref={revealCardRef} className="mt-8 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-[#888888]">YOUR EXCLUSIVE OFFER</p>
            <div className="mt-3 inline-flex flex-wrap items-center justify-center gap-3 rounded-full border border-[var(--border)] px-4 py-3">
              <code className="text-2xl font-bold text-[var(--green)]">{discountCode}</code>
              <Button
                type="button"
                onClick={copyCode}
                className="relative rounded-full bg-[var(--green)] px-4 py-2 text-white hover:bg-[var(--green)]/90"
              >
                <Copy size={16} />
                {copied && (
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-md border border-[var(--green-dim)] bg-white px-2 py-1 text-xs text-[var(--green)] shadow-sm">
                    Copied!
                  </span>
                )}
              </Button>
            </div>
          </div>
        )}

        <p className="mt-6 text-sm text-[var(--muted)]">
          Discount generated by Shopify at time of scan. Terms apply.
        </p>
      </div>
    </section>
  )
}

export default DiscountSection
