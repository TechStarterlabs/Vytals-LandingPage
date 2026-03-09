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
const AdminNavbar = lazy(() => import("@/components/AdminNavbar"))
const ProtectedRoute = lazy(() => import("@/components/ProtectedRoute"))
const AdminLogin = lazy(() => import("@/pages/admin/Login"))
const Dashboard = lazy(() => import("@/pages/admin/Dashboard"))
const Batches = lazy(() => import("@/pages/admin/Batches"))
const BatchView = lazy(() => import("@/pages/admin/BatchView"))
const BatchForm = lazy(() => import("@/pages/admin/BatchForm"))
const Serials = lazy(() => import("@/pages/admin/Serials"))
const SerialView = lazy(() => import("@/pages/admin/SerialView"))
const SerialForm = lazy(() => import("@/pages/admin/SerialForm"))
const SerialBulkUpload = lazy(() => import("@/pages/admin/SerialBulkUpload"))
const COA = lazy(() => import("@/pages/admin/COA"))
const COAView = lazy(() => import("@/pages/admin/COAView"))
const COAForm = lazy(() => import("@/pages/admin/COAForm"))
const COABulkUpload = lazy(() => import("@/pages/admin/COABulkUpload"))
const ScanLogs = lazy(() => import("@/pages/admin/ScanLogs"))
const Customers = lazy(() => import("@/pages/admin/Customers"))
const CustomerView = lazy(() => import("@/pages/admin/CustomerView"))
const CustomerForm = lazy(() => import("@/pages/admin/CustomerForm"))
const Rewards = lazy(() => import("@/pages/admin/Rewards"))
const RewardForm = lazy(() => import("@/pages/admin/RewardForm"))
const RewardView = lazy(() => import("@/pages/admin/RewardView"))
const Products = lazy(() => import("@/pages/admin/Products"))
const ProductView = lazy(() => import("@/pages/admin/ProductView"))
const ProductForm = lazy(() => import("@/pages/admin/ProductForm"))
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
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Suspense fallback={<div className="hidden lg:block w-20 bg-white border-r border-gray-200" />}>
        <AdminSidebar />
      </Suspense>
      <main className="flex-1 overflow-auto w-full lg:w-auto">
        <div className="p-4 pt-20 lg:pt-6 md:p-8 max-w-[1600px] mx-auto">
          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Loading...</div>
            </div>
          }>
            <Outlet />
          </Suspense>
        </div>
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
            <Route path="batches/new" element={<BatchForm />} />
            <Route path="batches/:id" element={<BatchView />} />
            <Route path="batches/:id/edit" element={<BatchForm />} />
            <Route path="serials" element={<Serials />} />
            <Route path="serials/new" element={<SerialForm />} />
            <Route path="serials/bulk" element={<SerialBulkUpload />} />
            <Route path="serials/:id" element={<SerialView />} />
            <Route path="serials/:id/edit" element={<SerialForm />} />
            <Route path="coa" element={<COA />} />
            <Route path="coa/new" element={<COAForm />} />
            <Route path="coa/bulk" element={<COABulkUpload />} />
            <Route path="coa/:id" element={<COAView />} />
            <Route path="coa/:id/edit" element={<COAForm />} />
            <Route path="scan-logs" element={<ScanLogs />} />
            <Route path="scan-logs/:id" element={<div>Scan Log View - Coming Soon</div>} />
            <Route path="customers" element={<Customers />} />
            <Route path="customers/new" element={<CustomerForm />} />
            <Route path="customers/:id" element={<CustomerView />} />
            <Route path="customers/:id/edit" element={<CustomerForm />} />
            <Route path="rewards" element={<Rewards />} />
            <Route path="rewards/new" element={<RewardForm />} />
            <Route path="rewards/:id" element={<RewardView />} />
            <Route path="rewards/:id/edit" element={<RewardForm />} />
            <Route path="products" element={<Products />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/:id" element={<ProductView />} />
            <Route path="products/:id/edit" element={<ProductForm />} />
            <Route path="users" element={<Users />} />
            <Route path="users/new" element={<div>User Form - Coming Soon</div>} />
            <Route path="users/:id" element={<div>User View - Coming Soon</div>} />
            <Route path="users/:id/edit" element={<div>User Form - Coming Soon</div>} />
          </Route>

          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </BrowserRouter>
    </VerificationStoreProvider>
  )
}

export default App
