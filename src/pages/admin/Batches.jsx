import { useEffect, useState } from "react"
import { Eye, Edit, Trash2, RotateCcw } from "lucide-react"
import DataTable from "@/components/DataTable"
import ConfirmDialog from "@/components/ConfirmDialog"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useNavigate, useLocation } from "react-router-dom"
import { useConfirm } from "@/hooks/use-confirm"
import { usePermissions } from "@/contexts/PermissionContext"

export default function Batches() {
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDeleted, setShowDeleted] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const { confirm, isOpen, config, handleConfirm, handleCancel } = useConfirm()
  const { canCreate, canUpdate, canDelete } = usePermissions()

  useEffect(() => {
    fetchBatches()
  }, [showDeleted])

  const fetchBatches = async () => {
    try {
      // Check if we need to filter by product (from navigation state)
      const productId = location.state?.productId
      const params = { include_deleted: showDeleted }
      if (productId) params.product_id = productId
      
      const response = await apiClient.get('/admin/batches', { params })
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
    const confirmed = await confirm({
      title: "Delete Batch",
      message: "Are you sure you want to delete this batch? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel"
    })
    
    if (!confirmed) return
    
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

  const handleRestore = async (batchId) => {
    const confirmed = await confirm({
      title: "Restore Batch",
      message: "Are you sure you want to restore this batch?",
      confirmText: "Restore",
      cancelText: "Cancel"
    })
    
    if (!confirmed) return
    
    try {
      await apiClient.post(`/admin/batches/${batchId}/restore`)
      toast({
        title: "Success",
        description: "Batch restored successfully",
        variant: "success"
      })
      fetchBatches()
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to restore batch",
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
          <p className="text-gray-900">{row.product?.name || '-'}</p>
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
            <p className={expired ? 'text-red-600' : 'text-gray-900'}>
              {date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
            {expired && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-red-100 text-red-800">
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
          <p className="text-gray-900">{row.serial_count || 0}</p>
        </div>
      )
    },
    {
      header: "COA",
      cell: (row) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${
          row.has_coa ? "bg-green-100 text-green-800" : "bg-red-100 text-gray-800"
        }`}>
          {row.has_coa ? "Yes" : " No"}
        </span>
      )
    },
    {
      header: "STATUS",
      cell: (row) => {
        const expired = isExpired(row.expiry_date)
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${
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
          {!row.deleted_at ? (
            <>
              <button
                onClick={() => handleView(row)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                title="View"
              >
                <Eye className="h-4 w-4 text-gray-600" />
              </button>
              {canUpdate('batches') && (
                <button
                  onClick={() => handleEdit(row)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit className="h-4 w-4 text-gray-600" />
                </button>
              )}
              {canDelete('batches') && (
                <button
                  onClick={() => handleDelete(row.batch_id)}
                  className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </button>
              )}
            </>
          ) : (
            <>
              {canDelete('batches') && (
                <button
                  onClick={() => handleRestore(row.batch_id)}
                  className="p-1.5 hover:bg-green-50 rounded-lg transition-colors"
                  title="Restore"
                >
                  <RotateCcw className="h-4 w-4 text-green-600" />
                </button>
              )}
              <span className="text-xs text-red-600 font-medium">Deleted</span>
            </>
          )}
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
        title="Batches"
        subtitle="Manage all product batches in the system"
        columns={columns}
        data={batches}
        onAdd={canCreate('batches') ? () => navigate('/admin/batches/new') : undefined}
        addButtonText="Add Batch"
        exportFileName="batches"
        customHeaderActions={canDelete('batches') ? (
          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              showDeleted 
                ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100' 
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            {showDeleted ? 'Hide Deleted' : 'Show Deleted'}
          </button>
        ) : undefined}
      />
    </div>
  )
}
