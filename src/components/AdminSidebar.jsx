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
  FileText,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Activity,
  UserCircle,
  Database,
  KeyRound,
  Zap,
  Globe
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { authService } from "@/lib/auth"
import { usePermissions } from "@/contexts/PermissionContext"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api"
import AdminNavbar from "./AdminNavbar"

export default function AdminSidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const { hasPermission, permissions } = usePermissions()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [adminInfo, setAdminInfo] = useState({ name: "", role: "" })
  const [openGroups, setOpenGroups] = useState({
    master: true,
    inventory: true,
    logs: false,
    apis: false,
    users: false
  })

  // Debug: Log permissions
  useEffect(() => {
    console.log('AdminSidebar permissions:', permissions)
  }, [permissions])

  useEffect(() => {
    fetchAdminInfo()
  }, [])

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMobileOpen(false)
  }, [location.pathname])

  const fetchAdminInfo = async () => {
    try {
      const response = await apiClient.get('/admin/profile')
      setAdminInfo({
        name: response.data.name || "Admin",
        role: response.data.role?.name || "admin"
      })
    } catch (err) {
      // Fallback to default
      setAdminInfo({ name: "Admin", role: "admin" })
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

  const toggleGroup = (groupName) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }))
  }

  const navigationStructure = [
    {
      type: 'single',
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/admin/dashboard",
      permission: "dashboard.view"
    },
    {
      type: 'group',
      name: 'master',
      icon: FolderOpen,
      label: "Master",
      items: [
        { icon: ShoppingBag, label: "Products", path: "/admin/products", permission: "products.view" },
        { icon: UserCog, label: "Roles", path: "/admin/roles", permission: "roles.view" },
        { icon: KeyRound, label: "API Clients", path: "/admin/clients", permission: "api_clients.view" }
      ]
    },
    {
      type: 'group',
      name: 'inventory',
      icon: Package,
      label: "Inventory",
      items: [
        { icon: Package, label: "Batches", path: "/admin/batches", permission: "batches.view" },
        { icon: Barcode, label: "Serial Management", path: "/admin/serials", permission: "serials.view" },
        { icon: FileText, label: "COA", path: "/admin/coa", permission: "coa.view" }
      ]
    },
    {
      type: 'group',
      name: 'logs',
      icon: Activity,
      label: "Logs",
      items: [
        { icon: ListChecks, label: "Scan Logs", path: "/admin/scan-logs", permission: "scan_logs.view" },
        { icon: Database, label: "Integration Logs", path: "/admin/integration-logs", permission: "integration_logs.view" },
      ]
    },
    {
      type: 'group',
      name: 'apis',
      icon: Globe,
      label: "APIs",
      items: [
        { icon: Zap, label: "Vytals Integration API", path: "/admin/integration-api", permission: "integration_logs.view" },
        { icon: Database, label: "ERP API (Business Central)", path: "/admin/erp-api", permission: "integration_logs.view" },
      ]
    },
    {
      type: 'group',
      name: 'users',
      icon: Users,
      label: "Users",
      items: [
        { icon: UserCircle, label: "Customers", path: "/admin/customers", permission: "customers.view" },
        { icon: UserCog, label: "Admin Users", path: "/admin/users", permission: "users.view" }
      ]
    },
    // {
    //   type: 'single',
    //   icon: Gift,
    //   label: "Rewards",
    //   path: "/admin/rewards",
    //   permission: "rewards.view"
    // }
  ]

  // Filter navigation based on permissions
  const filteredNavigation = navigationStructure.filter(item => {
    if (item.type === 'single') {
      return !item.permission || hasPermission(item.permission)
    }
    if (item.type === 'group') {
      // Filter group items
      const visibleItems = item.items.filter(child => 
        !child.permission || hasPermission(child.permission)
      )
      // Only show group if it has visible items
      return visibleItems.length > 0
    }
    return true
  }).map(item => {
    if (item.type === 'group') {
      return {
        ...item,
        items: item.items.filter(child => 
          !child.permission || hasPermission(child.permission)
        )
      }
    }
    return item
  })

  // Debug: Log filtered navigation
  useEffect(() => {
    console.log('Filtered navigation:', filteredNavigation)
  }, [filteredNavigation.length, permissions.length])

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
          {filteredNavigation.map((item, index) => {
            if (item.type === 'single') {
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
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="hidden lg:block absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
                      {item.label}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                    </div>
                  )}
                </button>
              )
            }

            // Group items
            const GroupIcon = item.icon
            const isGroupOpen = openGroups[item.name]
            const hasActiveChild = item.items.some(child => isActive(child.path))

            return (
              <div key={item.name} className="space-y-1">
                {/* Group Header */}
                <button
                  onClick={() => !isCollapsed && toggleGroup(item.name)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative ${
                    hasActiveChild
                      ? "bg-[#338291]/10 text-[#338291]"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  title={isCollapsed ? item.label : ''}
                >
                  <GroupIcon className={`h-5 w-5 flex-shrink-0 transition-colors ${
                    hasActiveChild ? "text-[#338291]" : "text-gray-600 group-hover:text-gray-900"
                  }`} />
                  <span className={`text-sm font-medium transition-all duration-300 whitespace-nowrap flex-1 text-left ${
                    isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'
                  }`}>
                    {item.label}
                  </span>
                  {!isCollapsed && (
                    isGroupOpen ? 
                      <ChevronDown className="h-4 w-4 flex-shrink-0" /> : 
                      <ChevronRight className="h-4 w-4 flex-shrink-0" />
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="hidden lg:block absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
                      {item.label}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                    </div>
                  )}
                </button>

                {/* Group Items */}
                {!isCollapsed && isGroupOpen && (
                  <div className="ml-4 space-y-1 border-l-2 border-gray-200 pl-2">
                    {item.items.map((child) => {
                      const ChildIcon = child.icon
                      const childActive = isActive(child.path)
                      
                      return (
                        <button
                          key={child.path}
                          onClick={() => navigate(child.path)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                            childActive
                              ? "bg-[#338291] text-white shadow-sm"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          <ChildIcon className={`h-4 w-4 flex-shrink-0 ${
                            childActive ? "text-white" : "text-gray-500 group-hover:text-gray-700"
                          }`} />
                          <span className="text-sm font-medium whitespace-nowrap">
                            {child.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
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
