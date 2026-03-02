import { Button } from "@/components/ui/button"

function CTASection() {
  return (
    <section
      id="store"
      className="relative w-full bg-[linear-gradient(rgba(234,246,244,0.94),rgba(234,246,244,0.92)),url('https://cdn.shopify.com/s/files/1/0724/4831/1464/files/Rectangle_8990.png?v=1762844508')] bg-cover bg-center py-14 sm:py-16 lg:py-20"
    >
      <div className="mx-auto w-full max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-[0.26em] text-[var(--green)]">SPUNGE STORE</p>
        <h2 className="mt-4 text-2xl font-bold sm:text-4xl lg:text-5xl">Explore the Complete Spunge Range</h2>
        <p className="mx-auto mt-4 max-w-2xl text-[var(--muted)]">
          Premium supplements. Third-party tested. Lab certified.
        </p>
        {/* DYNAMIC: replace URL with store link from config */}
        <Button
          asChild
          className="mt-7 h-11 rounded-full bg-[var(--green)] px-6 text-sm text-white hover:bg-[var(--green)]/90 sm:mt-8 sm:h-auto sm:px-8 sm:py-6 sm:text-base"
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
