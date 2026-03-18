import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function CustomerView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCustomer()
  }, [id])

  const fetchCustomer = async () => {
    try {
      const response = await apiClient.get(`/admin/users/${id}`)
      const user = response.data.user
      
      // Transform the data to match the expected format
      setCustomer({
        user_id: user.user_id,
        mobile_number: user.mobile_number,
        email: user.email || '',
        points_balance: user.points_balance || 0,
        scan_count: user.scan_count || 0,
        is_active: user.is_active,
        last_login_at: user.last_login_at,
        created_at: user.created_at,
        role: user.role
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load customer details",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this customer?")) return
    
    try {
      await apiClient.delete(`/admin/users/${id}`)
      toast({
        title: "Success",
        description: "Customer deleted successfully",
        variant: "success"
      })
      navigate("/admin/customers")
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete customer",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Customer not found</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/customers")}
            className="border-gray-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Customer Details</h1>
            <p className="text-sm text-gray-500 mt-1">View customer information</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/admin/customers/${id}/edit`)}
            className="border-gray-300"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Customer Info */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-[#338291] to-[#2a6d7a] border-b">
          <h2 className="text-lg font-semibold text-white">Customer Information</h2>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-500">Mobile</label>
            <p className="mt-1 text-base text-gray-900">{customer.mobile_number}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <p className="mt-1 text-base text-gray-900">{customer.email || "-"}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <p className="mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                customer.is_active 
                  ? "bg-green-100 text-green-800" 
                  : "bg-red-100 text-red-800"
              }`}>
                {customer.is_active ? "Active" : "Inactive"}
              </span>
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Points Balance</label>
            <p className="mt-1 text-base text-gray-900 font-semibold text-[#338291]">
              {customer.points_balance || 0}
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Total Scans</label>
            <p className="mt-1 text-base text-gray-900">{customer.scan_count || 0}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Last Login</label>
            <p className="mt-1 text-base text-gray-900">
              {customer.last_login_at 
                ? new Date(customer.last_login_at).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : "-"
              }
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Created Date</label>
            <p className="mt-1 text-base text-gray-900">
              {customer.created_at 
                ? new Date(customer.created_at).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })
                : "-"
              }
            </p>
          </div>
          
          {customer.role && (
            <div>
              <label className="text-sm font-medium text-gray-500">Role</label>
              <p className="mt-1 text-base text-gray-900 capitalize">{customer.role.name}</p>
            </div>
          )}
        </div>
      </div>

      {/* Activity History */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-[#338291] to-[#2a6d7a] border-b">
          <h2 className="text-lg font-semibold text-white">Activity History</h2>
        </div>
        
        <div className="p-6">
          <p className="text-gray-500 text-sm">No activity history available</p>
        </div>
      </div>
    </div>
  )
}
