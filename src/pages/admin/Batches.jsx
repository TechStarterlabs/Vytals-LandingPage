import { useEffect, useState } from "react"
import { Eye, Edit, Trash2 } from "lucide-react"
import DataTable from "@/components/DataTable"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useNavigate, useLocation } from "react-router-dom"

export default function Batches() {
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    fetchBatches()
  }, [])

  const fetchBatches = async () => {
    try {
      // Check if we need to filter by product (from navigation state)
      const productId = location.state?.productId
      const endpoint = productId 
        ? `/admin/batches?product_id=${productId}`
        : '/admin/batches'
      
      const response = await apiClient.get(endpoint)
      setBatches(response.data.batches || [])
    } catch (error) {
      console.error('Failed to fetch batches:', error)
      toast({
        title: "Error",
        description: "Failed to load batches",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleView = (batch) => {
    navigate(`/admin/batches/${batch.batch_id}`)
  }

  const handleEdit = (batch) => {
    navigate(`/admin/batches/${batch.batch_id}/edit`)
  }

  const handleDelete = async (batchId) => {
    if (!confirm("Are you sure you want to delete this batch? This action cannot be undone.")) return
    
    try {
      await apiClient.delete(`/admin/batches/${batchId}`)
      toast({
        title: "Success",
        description: "Batch deleted successfully",
        variant: "success"
      })
      fetchBatches()
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete batch. It may have associated serial numbers.",
        variant: "destructive"
      })
    }
  }

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false
    return new Date(expiryDate) < new Date()
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
      cell: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.product?.name || '-'}</p>
          <p className="text-xs text-gray-500">{row.product?.product_code || '-'}</p>
        </div>
      )
    },
    {
      header: "EXPIRY DATE",
      cell: (row) => {
        if (!row.expiry_date) return '-'
        const date = new Date(row.expiry_date)
        const expired = isExpired(row.expiry_date)
        return (
          <div>
            <p className={expired ? 'text-red-600 font-medium' : 'text-gray-900'}>
              {date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
            {expired && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                Expired
              </span>
            )}
          </div>
        )
      }
    },
    {
      header: "SERIALS",
      cell: (row) => (
        <div className="text-center">
          <p className="font-medium text-gray-900">{row.serial_count || 0}</p>
          {row.verified_count > 0 && (
            <p className="text-xs text-green-600">{row.verified_count} verified</p>
          )}
        </div>
      )
    },
    {
      header: "COA",
      cell: (row) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.has_coa ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
        }`}>
          {row.has_coa ? "✓ Yes" : "✗ No"}
        </span>
      )
    },
    {
      header: "STATUS",
      cell: (row) => {
        const expired = isExpired(row.expiry_date)
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            expired ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
          }`}>
            {expired ? "Expired" : "Active"}
          </span>
        )
      }
    },
    {
      header: "CREATED",
      cell: (row) => {
        if (!row.created_at) return "-"
        const date = new Date(row.created_at)
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })
      }
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
            onClick={() => handleDelete(row.batch_id)}
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
