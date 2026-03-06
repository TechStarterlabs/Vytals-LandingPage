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
      // TODO: Replace with actual API call
      // const data = await apiClient.get(`/admin/customers/${id}`)
      // setCustomer(data.data)
      
      // Mock data
      setCustomer({
        id: parseInt(id),
        name: "Akash Shetty",
        mobile: "9987900884",
        email: "shettykash20@gmail.com",
        status: "Active",
        created: "10/02/26",
        total_scans: 5,
        last_scan: "05/03/26"
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
      // await apiClient.delete(`/admin/customers/${id}`)
      toast({
        title: "Success",
        description: "Customer deleted successfully",
        variant: "success"
      })
      navigate("/admin/customers")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete customer",
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
            <label className="text-sm font-medium text-gray-500">Name</label>
            <p className="mt-1 text-base text-gray-900">{customer.name}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Mobile</label>
            <p className="mt-1 text-base text-gray-900">{customer.mobile}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <p className="mt-1 text-base text-gray-900">{customer.email || "-"}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <p className="mt-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {customer.status}
              </span>
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Created Date</label>
            <p className="mt-1 text-base text-gray-900">{customer.created}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Total Scans</label>
            <p className="mt-1 text-base text-gray-900">{customer.total_scans}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Last Scan</label>
            <p className="mt-1 text-base text-gray-900">{customer.last_scan}</p>
          </div>
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
