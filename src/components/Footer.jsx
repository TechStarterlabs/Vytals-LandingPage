const LOGO_URL =
  "https://cdn.shopify.com/s/files/1/0724/4831/1464/files/Frame_1000011104.png?v=1762514730"

const navLinks = ["Shop", "Blog", "Our Science", "About Us", "Contact"]

function Footer() {
  return (
    <footer className="mt-0 bg-[#034b57] text-white">
      <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        <div className="grid gap-7 md:grid-cols-[1.7fr_1fr_1fr] md:gap-10">
          <div>
            <img src={LOGO_URL} alt="Spunge logo" loading="lazy" className="h-9 w-auto brightness-0 invert" />
            <p className="mt-3 max-w-sm text-sm leading-6 text-white/90 sm:mt-4 sm:text-[15px]">
              We make wellness feel easy, trustworthy, and effective.
              <br />
              With clean ingredients and expert-crafted formulas you can count on.
            </p>
          </div>

          <nav aria-label="Footer links">
            <ul className="space-y-2 text-[15px] text-white/95 sm:space-y-2.5 sm:text-[17px]">
              {navLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="transition-opacity hover:opacity-80">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-2.5 text-[15px] text-white/95 sm:space-y-3 sm:text-[17px]">
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

        <div className="mt-7 border-t border-white/15 py-2.5 sm:mt-10 sm:py-3">
          <a href="#" className="text-sm text-white/90 transition-opacity hover:opacity-80 sm:text-[16px]">
            Privacy policy
          </a>
        </div>

        <div className="border-t border-white/15 py-2.5 text-xs text-white/90 sm:py-3 sm:text-sm">
          <p>© 2026, Spunge</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
