import { useNavigate, useLocation } from "react-router-dom"
import { LayoutDashboard, Package, Users, Settings, LogOut } from "lucide-react"
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarNav,
  SidebarNavItem
} from "@/components/ui/sidebar"
import { authService } from "@/lib/auth"

export default function AdminSidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    authService.removeToken()
    navigate("/admin/login")
  }

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
    { icon: Package, label: "Products", path: "/admin/products" },
    { icon: Users, label: "Users", path: "/admin/users" },
    { icon: Settings, label: "Settings", path: "/admin/settings" }
  ]

  return (
    <Sidebar>
      <SidebarHeader>
        <h2 className="text-xl font-bold">Vytals Admin</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarNav>
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <SidebarNavItem
                key={item.path}
                active={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                style={{ cursor: "pointer" }}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </SidebarNavItem>
            )
          })}
        </SidebarNav>
      </SidebarContent>
      <SidebarFooter>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  )
}
