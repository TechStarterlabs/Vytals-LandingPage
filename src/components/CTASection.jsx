import { Button } from "@/components/ui/button"

function CTASection() {
  return (
    <section
      id="store"
      className="relative bg-[linear-gradient(rgba(234,246,244,0.94),rgba(234,246,244,0.92)),url('https://cdn.shopify.com/s/files/1/0724/4831/1464/files/Rectangle_8990.png?v=1762844508')] py-20"
    >
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <p className="text-xs uppercase tracking-[0.26em] text-[var(--green)]">SPUNGE STORE</p>
        <h2 className="mt-4 text-3xl font-bold sm:text-5xl">Explore the Complete Spunge Range</h2>
        <p className="mx-auto mt-4 max-w-2xl text-[var(--muted)]">
          Premium supplements. Third-party tested. Lab certified.
        </p>
        {/* DYNAMIC: replace URL with store link from config */}
        <Button
          asChild
          className="mt-8 rounded-full bg-[var(--green)] px-8 py-6 text-base text-white hover:bg-[var(--green)]/90"
        >
          <a href="https://9ye0s3-gz.myshopify.com/" target="_blank" rel="noreferrer" aria-label="Shop Spunge products">
            Shop Now →
          </a>
        </Button>
      </div>
    </section>
  )
}

export default CTASection
