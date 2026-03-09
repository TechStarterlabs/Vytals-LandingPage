import { useEffect, useState } from "react"
import { Eye, Edit, Trash2 } from "lucide-react"
import DataTable from "@/components/DataTable"
import ConfirmDialog from "@/components/ConfirmDialog"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"
import { useConfirm } from "@/hooks/use-confirm"

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const navigate = useNavigate()
  const { confirm, isOpen, config, handleConfirm, handleCancel } = useConfirm()

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await apiClient.get('/admin/customers')
      // setCustomers(response.data)
      
      // Mock data for now
      setCustomers([
        {
          id: 1,
          name: "Akash Shetty",
          mobile: "9987900884",
          email: "shettykash20@gmail.com",
          status: "Active",
          created: "10/02/26"
        },
        {
          id: 2,
          name: "Aditi Kapoor",
          mobile: "7719913902",
          email: "",
          status: "Active",
          created: "21/02/26"
        },
        {
          id: 3,
          name: "Ali Fazil",
          mobile: "9558729247",
          email: "",
          status: "Active",
          created: "04/03/26"
        }
      ])
    } catch (error) {
      console.error('Failed to fetch customers:', error)
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (customer) => {
    navigate(`/admin/customers/${customer.id}/edit`)
  }

  const handleView = (customer) => {
    navigate(`/admin/customers/${customer.id}`)
  }

  const handleDelete = async (customerId) => {
    const confirmed = await confirm({
      title: "Delete Customer",
      message: "Are you sure you want to delete this customer?",
      confirmText: "Delete",
      cancelText: "Cancel"
    })
    
    if (!confirmed) return
    
    try {
      // await apiClient.delete(`/admin/customers/${customerId}`)
      setCustomers(customers.filter(c => c.id !== customerId))
      toast({
        title: "Success",
        description: "Customer deleted successfully",
        variant: "success"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete customer",
        variant: "destructive"
      })
    }
  }

  const columns = [
    {
      header: "#",
      cell: (row, index) => index + 1
    },
    {
      header: "NAME",
      accessor: "name"
    },
    {
      header: "MOBILE",
      accessor: "mobile"
    },
    {
      header: "EMAIL",
      cell: (row) => row.email || "-"
    },
    {
      header: "STATUS",
      cell: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {row.status}
        </span>
      )
    },
    {
      header: "CREATED",
      accessor: "created"
    },
    {
      header: "ACTIONS",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleView(row)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            title="View"
          >
            <Eye className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </button>
        </div>
      )
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <ConfirmDialog
        isOpen={isOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        {...config}
      />
      <DataTable
        title="Customers"
        subtitle="Manage all customers in the system"
        columns={columns}
        data={customers}
        onAdd={() => navigate('/admin/customers/new')}
        addButtonText="Add Customer"
        exportFileName="customers"
      />
    </div>
  )
}
