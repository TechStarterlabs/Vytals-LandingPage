import { useState } from "react"
import { Eye, Edit, Trash2 } from "lucide-react"
import DataTable from "@/components/DataTable"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"

export default function Serials() {
  const [serials] = useState([
    // Placeholder data - replace with API call
    {
      id: 1,
      serial_number: "SN123456789",
      batch_code: "BATCH001",
      product_name: "Product A",
      status: "Available",
      scanned: "No",
      created: "01/01/26"
    }
  ])
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleView = (serial) => {
    navigate(`/admin/serials/${serial.id}`)
  }

  const handleEdit = (serial) => {
    navigate(`/admin/serials/${serial.id}/edit`)
  }

  const handleDelete = (serialId) => {
    if (!confirm("Are you sure you want to delete this serial number?")) return
    toast({
      title: "Info",
      description: "Delete functionality coming soon",
    })
  }

  const columns = [
    {
      header: "#",
      cell: (row, index) => index + 1
    },
    {
      header: "SERIAL NUMBER",
      accessor: "serial_number"
    },
    {
      header: "BATCH CODE",
      accessor: "batch_code"
    },
    {
      header: "PRODUCT",
      accessor: "product_name"
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
      header: "SCANNED",
      cell: (row) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.scanned === "Yes" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
        }`}>
          {row.scanned}
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

  return (
    <div>
      <DataTable
        title="Serial Management"
        subtitle="Manage all serial numbers in the system"
        columns={columns}
        data={serials}
        onAdd={() => navigate('/admin/serials/new')}
        addButtonText="Add Serial"
        exportFileName="serial-numbers"
      />
    </div>
  )
}
