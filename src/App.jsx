import { useEffect, useState } from "react"
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom"

import Footer from "@/components/Footer"
import HeroBackground from "@/components/HeroBackground"
import Loader from "@/components/Loader"
import Navbar from "@/components/Navbar"
import { VerificationStoreProvider } from "@/lib/verification-store"
import Home from "@/pages/Home"
import Verification from "@/pages/Verification"

function ScrollToTopAndHash() {
  const location = useLocation()

  useEffect(() => {
    if (location.hash) {
      const sectionId = location.hash.replace("#", "")
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 50)
      return
    }
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [location.pathname, location.hash])

  return null
}

function AppLayout() {
  const location = useLocation()
  const isHome = location.pathname === "/"
  const isVerificationPage = location.pathname === "/verify"

  return (
    <div className="relative min-h-screen bg-[var(--bg)] text-[var(--white)]">
      <HeroBackground />
      <Navbar compact={isHome || isVerificationPage} />
      <main className="relative z-10">
        <Outlet />
      </main>
      {!isHome && (
        <div className="relative z-10">
          <Footer />
        </div>
      )}
    </div>
  )
}

function App() {
  const [showLoader, setShowLoader] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => setShowLoader(false), 2500)
    return () => window.clearTimeout(timer)
  }, [])

  if (showLoader) {
    return <Loader />
  }

  return (
    <VerificationStoreProvider>
      <BrowserRouter>
        <ScrollToTopAndHash />
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/verify" element={<Verification />} />
            <Route path="*" element={<Navigate replace to="/" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </VerificationStoreProvider>
  )
}

export default App
