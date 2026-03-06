import { useNavigate, useLocation } from "react-router-dom"
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  LogOut,
  Barcode,
  ListChecks,
  Gift,
  UserCog,
  Menu,
  User,
  X,
  ShoppingBag,
  FileText
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { authService } from "@/lib/auth"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api"
import AdminNavbar from "./AdminNavbar"

export default function AdminSidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [adminInfo, setAdminInfo] = useState({ name: "", role: "" })

  useEffect(() => {
    fetchAdminInfo()
  }, [])

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMobileOpen(false)
  }, [location.pathname])

  const fetchAdminInfo = async () => {
    try {
      const data = await apiClient.get('/admin/profile')
      setAdminInfo({
        name: data.data.name || "Admin",
        role: data.data.role?.name || "superadmin"
      })
    } catch (err) {
      // Fallback to default
      setAdminInfo({ name: "Admin", role: "superadmin" })
    }
  }

  const handleLogout = () => {
    authService.removeToken()
    toast({
      title: "Success",
      description: "Logged out successfully",
      variant: "success",
    })
    navigate("/admin/login")
  }

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
    { icon: ShoppingBag, label: "Products", path: "/admin/products" },
    { icon: Package, label: "Batches", path: "/admin/batches" },
    { icon: Barcode, label: "Serial Management", path: "/admin/serials" },
    { icon: FileText, label: "COA", path: "/admin/coa" },
    { icon: ListChecks, label: "Scan Logs", path: "/admin/scan-logs" },
    { icon: Users, label: "Customers", path: "/admin/customers" },
    { icon: Gift, label: "Rewards", path: "/admin/rewards" },
    { icon: UserCog, label: "Admin Users", path: "/admin/users" }
  ]

  const isActive = (path) => location.pathname.startsWith(path)

  return (
    <>
      {/* Mobile Navbar */}
      <AdminNavbar onMenuClick={() => setIsMobileOpen(!isMobileOpen)} />

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-64'}
        lg:relative fixed top-0 left-0 z-40
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo & Toggle - Desktop Only */}
        <div className="hidden lg:flex h-16 border-b border-gray-200 items-center justify-between px-4 flex-shrink-0">
          <div className={`transition-all duration-300 overflow-hidden ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            <img 
              src="https://cdn.shopify.com/s/files/1/0724/4831/1464/files/Frame_1000011104.png?v=1762514730" 
              alt="Vytals" 
              className="h-8"
            />
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 ml-auto"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden h-16 border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900">Admin Panel</h2>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-3 border-b border-gray-200 flex-shrink-0">
          <div className={`flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="h-8 w-8 rounded-full bg-[#338291] flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className={`transition-all duration-300 overflow-hidden ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
              <p className="text-sm font-medium text-gray-900 truncate">{adminInfo.name}</p>
              <p className="text-xs text-gray-500 capitalize">{adminInfo.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative ${
                  active
                    ? "bg-[#338291] text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                title={isCollapsed ? item.label : ''}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 transition-colors ${
                  active ? "text-white" : "text-gray-600 group-hover:text-gray-900"
                }`} />
                <span className={`text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'
                }`}>
                  {item.label}
                </span>
                
                {/* Tooltip for collapsed state - only on desktop */}
                {isCollapsed && (
                  <div className="hidden lg:block absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
                    {item.label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                  </div>
                )}
              </button>
            )
          })}
        </nav>

        {/* Logout - Desktop Only */}
        <div className="hidden lg:block p-3 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group relative"
            title={isCollapsed ? 'Logout' : ''}
          >
            <LogOut className="h-5 w-5 flex-shrink-0 text-gray-600 group-hover:text-red-600 transition-colors" />
            <span className={`text-sm font-medium transition-all duration-300 whitespace-nowrap ${
              isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'
            }`}>
              Logout
            </span>
            
            {/* Tooltip for collapsed state - only on desktop */}
            {isCollapsed && (
              <div className="hidden lg:block absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
                Logout
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
              </div>
            )}
          </button>
        </div>
      </div>
    </>
  )
}
