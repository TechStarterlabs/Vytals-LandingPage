import { Menu, LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { authService } from "@/lib/auth"

export default function AdminNavbar({ onMenuClick }) {
  const navigate = useNavigate()
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

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 h-16">
        {/* Menu Button */}
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="h-6 w-6 text-gray-600" />
        </button>

        {/* Logo */}
        <img 
          src="https://cdn.shopify.com/s/files/1/0724/4831/1464/files/Frame_1000011104.png?v=1762514730" 
          alt="Vytals" 
          className="h-8"
        />

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5 text-red-600" />
        </button>
      </div>
    </div>
  )
}
