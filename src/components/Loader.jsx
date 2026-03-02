import { useEffect, useState } from "react"

const LOADER_ICON_URL =
  "https://cdn.shopify.com/s/files/1/0724/4831/1464/files/Group.png?v=1762514765"

function Loader() {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => setIsVisible(false), 2250)
    return () => window.clearTimeout(fadeTimer)
  }, [])

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-[var(--bg)] transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="loader-enter flex flex-col items-center gap-8">
        <div className="relative">
          <span className="absolute inset-0 rounded-full border border-[var(--green)]/25" />
          <span className="absolute inset-0 rounded-full border-2 border-t-[var(--green)] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <img
            src={LOADER_ICON_URL}
            alt="Spunge loading icon"
            loading="lazy"
            className="h-16 w-16 rounded-full bg-white p-2 [animation:loaderIn_0.6s_ease_forwards,pulseGlow_1.5s_ease-in-out_0.6s_1]"
          />
        </div>
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">Spunge Verification</p>
          <p className="mt-1 text-sm text-[var(--white)]/90">Preparing secure verification experience...</p>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 h-[3px] w-full bg-[var(--green-dim)]/50">
        <div className="h-full animate-[loaderProgress_2.5s_linear_forwards] bg-[var(--green)]" />
      </div>
    </div>
  )
}

export default Loader
