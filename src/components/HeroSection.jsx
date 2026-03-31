import { lazy, Suspense, useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { gsap } from "gsap"
import { ChevronDown } from "lucide-react"

import { verificationApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

const HeroBackground = lazy(() => import("@/components/HeroBackground"))

export default function HeroSection() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const formCardRef = useRef(null)
  const buttonRef = useRef(null)

  const [products, setProducts] = useState([])
  const [selectedSlug, setSelectedSlug] = useState("")
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    verificationApi.getProducts()
      .then(res => setProducts(res.data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!formCardRef.current) return
    gsap.fromTo(
      formCardRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", delay: 0.05 },
    )
  }, [])

  const selectedProduct = products.find(p => p.slug === selectedSlug)

  const handleNext = () => {
    if (!selectedSlug) {
      toast({ title: "Select a product", description: "Please choose a product to continue.", variant: "destructive" })
      return
    }
    if (formCardRef.current) {
      gsap.to(formCardRef.current, { y: -6, scale: 0.985, duration: 0.2, ease: "power2.out" })
    }
    setTimeout(() => navigate(`/${selectedSlug}`), 250)
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
            <span className="fade-up block [animation-delay:160ms]">Your Product.</span>
            <span className="fade-up block [animation-delay:300ms]">Verified.</span>
            <span className="fade-up block [animation-delay:420ms]">Instantly.</span>
          </h1>
          <p className="max-w-xl text-sm text-[#4f4f4f] sm:text-lg">
            Select your product below to begin the verification process.
          </p>
        </div>

        {/* Product selector card */}
        <div className="relative w-full rounded-3xl border border-[#E8ECE8] bg-[#F7F8F5] p-3 sm:p-6">
          <div ref={formCardRef} className="relative z-10 rounded-2xl border border-[#E8ECE8] bg-white p-3.5 sm:p-5">
            <label className="block text-sm font-medium text-[#111111] mb-2">
              Select Product
            </label>

            {/* Custom dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => !loading && setIsOpen(o => !o)}
                className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm outline-none transition-colors ${
                  isOpen ? "border-[var(--green)]" : "border-[#E8ECE8]"
                } ${loading ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-[var(--green)]"}`}
              >
                <span className={selectedProduct ? "text-[#111111]" : "text-gray-400"}>
                  {loading
                    ? "Loading products…"
                    : selectedProduct
                      ? `${selectedProduct.name}${selectedProduct.pack_size ? ` — ${selectedProduct.pack_size}` : ""}`
                      : "Choose a product…"}
                </span>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>

              {isOpen && products.length > 0 && (
                <ul className="absolute z-20 mt-1 w-full rounded-xl border border-[#E8ECE8] bg-white shadow-lg max-h-56 overflow-y-auto">
                  {products.map(product => (
                    <li key={product.product_id}>
                      <button
                        type="button"
                        onClick={() => { setSelectedSlug(product.slug); setIsOpen(false) }}
                        className={`w-full px-4 py-3 text-left text-sm hover:bg-[#F7F8F5] transition-colors ${
                          selectedSlug === product.slug ? "bg-[#F0FAF9] text-[var(--green)] font-medium" : "text-[#111111]"
                        }`}
                      >
                        {product.name}
                        {product.pack_size && <span className="ml-1 text-gray-400">— {product.pack_size}</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {isOpen && !loading && products.length === 0 && (
                <div className="absolute z-20 mt-1 w-full rounded-xl border border-[#E8ECE8] bg-white shadow-lg px-4 py-3 text-sm text-gray-400">
                  No products available
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={!selectedSlug || loading}
              onClick={handleNext}
              onMouseEnter={handleButtonHover}
              onMouseLeave={handleButtonLeave}
              ref={buttonRef}
              className="mt-4 w-full rounded-xl bg-[var(--green)] py-3 font-bold text-white transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
