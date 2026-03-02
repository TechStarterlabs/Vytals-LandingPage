const LOGO_URL =
  "https://cdn.shopify.com/s/files/1/0724/4831/1464/files/Frame_1000011104.png?v=1762514730"

const navLinks = ["Shop", "Blog", "Our Science", "About Us", "Contact"]

function Footer() {
  return (
    <footer className="mt-0 bg-[#034b57] text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.7fr_1fr_1fr]">
          <div>
            <img src={LOGO_URL} alt="Spunge logo" loading="lazy" className="h-9 w-auto brightness-0 invert" />
            <p className="mt-4 max-w-sm text-[15px] leading-6 text-white/90">
              We make wellness feel easy, trustworthy, and effective.
              <br />
              With clean ingredients and expert-crafted formulas you can count on.
            </p>
          </div>

          <nav aria-label="Footer links">
            <ul className="space-y-2.5 text-[17px] text-white/95">
              {navLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="transition-opacity hover:opacity-80">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-3 text-[17px] text-white/95">
            <p className="flex items-center gap-2">
              <span aria-hidden>📞</span>
              <span>+91 1800 123 4567</span>
            </p>
            <p className="flex items-center gap-2">
              <span aria-hidden>✉</span>
              <span>Info@gmail.com</span>
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-white/15 py-3">
          <a href="#" className="text-[16px] text-white/90 transition-opacity hover:opacity-80">
            Privacy policy
          </a>
        </div>

        <div className="border-t border-white/15 py-3 text-sm text-white/90">
          <p>© 2026, Spunge</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
