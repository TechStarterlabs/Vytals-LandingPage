import { useNavigate, useLocation } from "react-router-dom"
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  LogOut,
  Barcode,
  ListChecks,
  Gift,
  UserCog
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
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
  const { toast } = useToast()

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
    { icon: Package, label: "Batches", path: "/admin/batches" },
    { icon: Barcode, label: "Serial Management", path: "/admin/serials" },
    { icon: ListChecks, label: "Scan Logs", path: "/admin/scan-logs" },
    { icon: Users, label: "Customers", path: "/admin/customers" },
    { icon: Gift, label: "Rewards", path: "/admin/rewards" },
    { icon: UserCog, label: "Admin Users", path: "/admin/users" }
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
