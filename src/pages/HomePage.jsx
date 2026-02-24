import { Button } from "@/components/ui/button"
import SectionTitle from "@/components/shared/SectionTitle"

function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
      <section className="max-w-xl rounded-xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <SectionTitle
          title="Home Page"
          subtitle="This page uses one shared component and one shadcn button."
        />
        <div className="mt-6">
          <Button variant="outline" className="text-black">
            Button
          </Button>
        </div>
      </section>
    </main>
  )
}

export default HomePage
