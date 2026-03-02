import { useEffect } from "react"

const cards = [
  {
    icon: "💊",
    title: "Your Product",
    dosage: "2 capsules daily",
    timing: "Morning with water",
    note: "Consistency is key for best results",
  },
  {
    icon: "🧪",
    title: "Stack Suggestion",
    dosage: "As directed",
    timing: "With meals",
    note: "[Pair recommendations from API]",
  },
  {
    icon: "🏋️",
    title: "Recovery Support",
    dosage: "1 serving",
    timing: "Post workout",
    note: "[from product metadata]",
  },
]
const delayClasses = ["[transition-delay:0ms]", "[transition-delay:120ms]", "[transition-delay:240ms]"]

function CoachSection() {
  useEffect(() => {
    const elements = document.querySelectorAll(".coach-card")
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("opacity-0", "translate-y-8")
            entry.target.classList.add("opacity-100", "translate-y-0")
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.2 },
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section id="coach" className="bg-shift overflow-hidden bg-[linear-gradient(120deg,#edf8f6,#f8fcfb,#edf8f6)] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--green)]">Guided by experts</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Your Expert Wellness Plan</h2>
            <p className="mt-3 text-[var(--muted)]">
              Curated specifically for your product
              {/* DYNAMIC: include verified product name here */}
            </p>
          </div>

          <div className="relative h-24 w-24">
            <svg viewBox="0 0 120 120" className="spin-slow h-full w-full text-[var(--green)]">
              <defs>
                <path id="circlePath" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
              </defs>
              <text className="fill-current text-[12px] tracking-[0.18em]">
                <textPath href="#circlePath">EXPERT CURATED • EXPERT CURATED •</textPath>
              </text>
            </svg>
          </div>
        </div>

        <div className="flex snap-x gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-3 lg:overflow-visible">
          {cards.map((card, index) => (
            <article
              key={card.title}
              className={`coach-card min-w-[84%] snap-start rounded-2xl border border-[var(--border)] bg-white p-6 opacity-0 translate-y-8 transition duration-700 hover:-translate-y-1 hover:border-[var(--green)]/50 hover:shadow-[0_8px_24px_var(--green-glow)] lg:min-w-0 ${delayClasses[index]}`}
            >
              <div className="mb-3 text-3xl">{card.icon}</div>
              <h3 className="text-xl font-semibold">
                [{card.title}]
                {/* DYNAMIC: supplement title from API */}
              </h3>
              <div className="mt-4 space-y-2 text-sm text-[var(--muted)]">
                <p>Dosage: [{card.dosage}]</p>
                <p>Best time: [{card.timing}]</p>
                <p>Expert note: [{card.note}]</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CoachSection
