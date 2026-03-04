import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Menu , X } from "lucide-react"
import { gsap } from "gsap"

const LOGO_URL =
  "https://cdn.shopify.com/s/files/1/0724/4831/1464/files/Frame_1000011104.png?v=1762514730"

const navItems = [
  { label: "Home", to: "/", hash: "#home" },
  { label: "Verify", to: "/verify" },
]

function Navbar({ compact = false }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isAnimatingMenu, setIsAnimatingMenu] = useState(false)

  const handleLogoClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Force navigation by using window.location if on different page
    if (location.pathname !== "/") {
      window.location.href = "/"
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    onScroll()
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname, location.hash])

  useEffect(() => {
    const panel = document.querySelector(".mobile-nav-panel")
    if (!panel || compact || isAnimatingMenu) return
    setIsAnimatingMenu(true)

    if (menuOpen) {
      gsap.fromTo(panel, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.28, ease: "power2.out", onComplete: () => setIsAnimatingMenu(false) })
      return
    }

    gsap.to(panel, { opacity: 0, y: -8, duration: 0.2, ease: "power2.in", onComplete: () => setIsAnimatingMenu(false) })
  }, [compact, isAnimatingMenu, menuOpen])

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled ? "border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-md" : "border-transparent bg-[var(--bg)]/80"
      }`}
    >
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="/" onClick={handleLogoClick} className="shrink-0 cursor-pointer">
          <img src={LOGO_URL} alt="Spunge logo" loading="lazy" className="h-9 w-auto" />
        </a>

        {!compact && <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.hash ? `${item.to}${item.hash}` : item.to}
              className="text-sm font-medium text-[var(--white)]/85 transition-colors hover:text-[var(--green)]"
            >
              {item.label}
            </Link>
          ))}
        </div>}

        {compact && (
          <div className="hidden items-center md:flex">
            <span className="rounded-full border border-[#D9E2DE] bg-white/70 px-3 py-1 text-xs text-[#666666]">
              Secure Serial Verification
            </span>
          </div>
        )}

        {!compact && <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="inline-flex rounded-md border border-[var(--border)] bg-white p-2 text-[var(--muted)] md:hidden"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>}
      </nav>

      {!compact && <div
        className={`mobile-nav-panel overflow-hidden border-t border-[var(--border)] bg-[var(--surface)]/95 transition-all duration-300 md:hidden ${
          menuOpen ? "max-h-96 py-4" : "max-h-0 py-0"
        }`}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 sm:px-6">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.hash ? `${item.to}${item.hash}` : item.to}
              className="rounded-md px-3 py-2 text-sm text-[var(--white)]/85 transition-colors hover:bg-[var(--green-glow)] hover:text-[var(--green)]"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>}
    </header>
  )
}

export default Navbar
