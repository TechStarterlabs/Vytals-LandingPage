import { useEffect, useState } from "react"
import { Eye, Edit, Trash2, RotateCcw } from "lucide-react"
import DataTable from "@/components/DataTable"
import ConfirmDialog from "@/components/ConfirmDialog"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"
import { useConfirm } from "@/hooks/use-confirm"
import { usePermissions } from "@/contexts/PermissionContext"
import PermissionRoute from "@/components/PermissionRoute"

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDeleted, setShowDeleted] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()
  const { confirm, isOpen, config, handleConfirm, handleCancel } = useConfirm()
  const { canCreate, canUpdate, canDelete, permissions, hasPermission } = usePermissions()

  useEffect(() => {
    fetchProducts()
  }, [showDeleted])

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get('/admin/products', {
        params: { include_deleted: showDeleted }
      })
      setProducts(response.data.products || [])
    } catch (error) {
      console.error('Failed to fetch products:', error)
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleView = (product) => {
    navigate(`/admin/products/${product.product_id}`)
  }

  const handleEdit = (product) => {
    navigate(`/admin/products/${product.product_id}/edit`)
  }

  const handleDelete = async (productId) => {
    const confirmed = await confirm({
      title: "Delete Product",
      message: "Are you sure you want to delete this product? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel"
    })
    
    if (!confirmed) return
    
    try {
      await apiClient.delete(`/admin/products/${productId}`)
      toast({
        title: "Success",
        description: "Product deleted successfully",
        variant: "success"
      })
      fetchProducts()
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product. It may have associated batches.",
        variant: "destructive"
      })
    }
  }

  const handleRestore = async (productId) => {
    const confirmed = await confirm({
      title: "Restore Product",
      message: "Are you sure you want to restore this product?",
      confirmText: "Restore",
      cancelText: "Cancel"
    })
    
    if (!confirmed) return
    
    try {
      await apiClient.post(`/admin/products/${productId}/restore`)
      toast({
        title: "Success",
        description: "Product restored successfully",
        variant: "success"
      })
      fetchProducts()
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to restore product",
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
      header: "PRODUCT CODE",
      accessor: "product_code"
    },
    {
      header: "NAME",
      accessor: "name"
    },
    {
      header: "PACK TYPE",
      accessor: "pack_type"
    },
    {
      header: "PACK SIZE",
      accessor: "pack_size"
    },
    {
      header: "BATCHES",
      cell: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
          {row.batch_count || 0}
        </span>
      )
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
              {canUpdate('products') && (
                <button
                  onClick={() => handleEdit(row)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit className="h-4 w-4 text-gray-600" />
                </button>
              )}
              {canDelete('products') && (
                <button
                  onClick={() => handleDelete(row.product_id)}
                  className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </button>
              )}
            </>
          ) : (
            <>
              {canDelete('products') && (
                <button
                  onClick={() => handleRestore(row.product_id)}
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
    <PermissionRoute permission="products.view">
      <ConfirmDialog
        isOpen={isOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        {...config}
      />
      <DataTable
        title="Products"
        subtitle="Manage all products in the system"
        columns={columns}
        data={products}
        onAdd={canCreate('products') ? () => navigate('/admin/products/new') : undefined}
        addButtonText="Add Product"
        exportFileName="products"
        customHeaderActions={canDelete('products') ? (
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
    </PermissionRoute>
  )
}
