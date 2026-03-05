import { lazy, Suspense, useEffect } from "react"
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom"

import Loader from "@/components/Loader"
import Navbar from "@/components/Navbar"
import { Toaster } from "@/components/ui/toaster"
import { VerificationStoreProvider } from "@/lib/verification-store"

// Lazy load only admin components
const Home = lazy(() => import("@/pages/Home"))
const Verification = lazy(() => import("@/pages/Verification"))
const Footer = lazy(() => import("@/components/Footer"))
const AdminSidebar = lazy(() => import("@/components/AdminSidebar"))
const ProtectedRoute = lazy(() => import("@/components/ProtectedRoute"))
const AdminLogin = lazy(() => import("@/pages/admin/Login"))
const Dashboard = lazy(() => import("@/pages/admin/Dashboard"))
const Batches = lazy(() => import("@/pages/admin/Batches"))
const Serials = lazy(() => import("@/pages/admin/Serials"))
const ScanLogs = lazy(() => import("@/pages/admin/ScanLogs"))
const Customers = lazy(() => import("@/pages/admin/Customers"))
const Rewards = lazy(() => import("@/pages/admin/Rewards"))
const Products = lazy(() => import("@/pages/admin/Products"))
const Users = lazy(() => import("@/pages/admin/Users"))

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
    <div className="relative flex min-h-screen flex-col bg-[var(--bg)] text-[var(--white)]">
      <Navbar compact={isHome || isVerificationPage} />
      <main className="relative z-10 flex-1" key={location.pathname}>
        <Outlet />
      </main>
      {(isHome || isVerificationPage) && (
        <div className="relative z-10">
          <Suspense fallback={null}>
            <Footer />
          </Suspense>
        </div>
      )}
    </div>
  )
}

function AdminLayout() {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <Suspense fallback={<Loader />}>
        <AdminSidebar />
      </Suspense>
      <main className="flex-1 overflow-auto p-8">
        <Suspense fallback={<Loader />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}

function App() {
  return (
    <VerificationStoreProvider>
      <BrowserRouter>
        <ScrollToTopAndHash />
        <Toaster />
        <Routes>
          <Route element={<AppLayout />}>
            <Route
              path="/"
              element={
                <Suspense fallback={<Loader />}>
                  <Home />
                </Suspense>
              }
            />
            <Route
              path="/verify"
              element={
                <Suspense fallback={<Loader />}>
                  <Verification />
                </Suspense>
              }
            />
          </Route>

          <Route
            path="/admin/login"
            element={
              <Suspense fallback={<Loader />}>
                <AdminLogin />
              </Suspense>
            }
          />
          
          <Route
            path="/admin"
            element={
              <Suspense fallback={<Loader />}>
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              </Suspense>
            }
          >
            <Route index element={<Navigate replace to="/admin/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="batches" element={<Batches />} />
            <Route path="serials" element={<Serials />} />
            <Route path="scan-logs" element={<ScanLogs />} />
            <Route path="customers" element={<Customers />} />
            <Route path="rewards" element={<Rewards />} />
            <Route path="products" element={<Products />} />
            <Route path="users" element={<Users />} />
          </Route>

          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </BrowserRouter>
    </VerificationStoreProvider>
  )
}

export default App
