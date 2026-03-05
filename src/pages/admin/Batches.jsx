import { useState } from "react"
import { Eye, Edit, Trash2 } from "lucide-react"
import DataTable from "@/components/DataTable"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"

export default function Batches() {
  const [batches] = useState([
    // Placeholder data - replace with API call
    {
      id: 1,
      batch_code: "BATCH001",
      product_name: "Product A",
      quantity: 1000,
      manufactured_date: "01/01/26",
      expiry_date: "01/01/27",
      status: "Active"
    }
  ])
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleView = (batch) => {
    navigate(`/admin/batches/${batch.id}`)
  }

  const handleEdit = (batch) => {
    navigate(`/admin/batches/${batch.id}/edit`)
  }

  const handleDelete = (batchId) => {
    if (!confirm("Are you sure you want to delete this batch?")) return
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
      header: "BATCH CODE",
      accessor: "batch_code"
    },
    {
      header: "PRODUCT",
      accessor: "product_name"
    },
    {
      header: "QUANTITY",
      accessor: "quantity"
    },
    {
      header: "MANUFACTURED",
      accessor: "manufactured_date"
    },
    {
      header: "EXPIRY",
      accessor: "expiry_date"
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
        title="Batches"
        subtitle="Manage all product batches in the system"
        columns={columns}
        data={batches}
        onAdd={() => navigate('/admin/batches/new')}
        addButtonText="Add Batch"
        exportFileName="batches"
      />
    </div>
  )
}
