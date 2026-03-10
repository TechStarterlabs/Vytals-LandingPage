import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Edit, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import PermissionRoute from "@/components/PermissionRoute"
import { usePermissions } from "@/contexts/PermissionContext"

export default function ProductView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { canUpdate } = usePermissions()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const response = await apiClient.get(`/admin/products/${id}`)
      setProduct(response.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load product details",
        variant: "destructive"
      })
      navigate('/admin/products')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!product) {
    return null
  }

  return (
    <PermissionRoute permission="products.view">
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/products")}
            className="border-gray-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Product Details
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              View product information
            </p>
          </div>
        </div>
        {canUpdate('products') && (
          <Button
            onClick={() => navigate(`/admin/products/${id}/edit`)}
            className="bg-[#11b5b2] hover:bg-[#0fa09d] text-white"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Product
          </Button>
        )}
      </div>

      {/* Product Information */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-[#11b5b2] to-[#0fa09d] border-b">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Information
          </h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Product Code
              </label>
              <p className="text-base font-semibold text-gray-900">
                {product.product_code}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Product Name
              </label>
              <p className="text-base font-semibold text-gray-900">
                {product.name}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Pack Type
              </label>
              <p className="text-base text-gray-900">
                {product.pack_type}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Pack Size
              </label>
              <p className="text-base text-gray-900">
                {product.pack_size}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Total Batches
              </label>
              <p className="text-base text-gray-900">
                {product.batch_count || 0}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Created At
              </label>
              <p className="text-base text-gray-900">
                {product.created_at ? new Date(product.created_at).toLocaleString() : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </PermissionRoute>
  )
}
