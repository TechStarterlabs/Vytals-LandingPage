import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Edit, Trash2, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function ProductView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
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

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) return
    
    try {
      await apiClient.delete(`/admin/products/${id}`)
      toast({
        title: "Success",
        description: "Product deleted successfully",
        variant: "success"
      })
      navigate("/admin/products")
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product. It may have associated batches.",
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

  if (!product) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Product not found</div>
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
            onClick={() => navigate("/admin/products")}
            className="border-gray-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Product Details</h1>
            <p className="text-sm text-gray-500 mt-1">View product information</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/admin/products/${id}/edit`)}
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

      {/* Product Info */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-[#338291] to-[#2a6d7a] border-b">
          <h2 className="text-lg font-semibold text-white">Product Information</h2>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-500">Product Code</label>
            <p className="mt-1 text-base text-gray-900 font-mono">{product.product_code}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Product Name</label>
            <p className="mt-1 text-base text-gray-900">{product.name}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Pack Type</label>
            <p className="mt-1 text-base text-gray-900">{product.pack_type}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Pack Size</label>
            <p className="mt-1 text-base text-gray-900">{product.pack_size}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Total Batches</label>
            <p className="mt-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {product.batch_count || 0} Batches
              </span>
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Created Date</label>
            <p className="mt-1 text-base text-gray-900">
              {product.created_at ? new Date(product.created_at).toLocaleDateString('en-GB', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
              }) : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Associated Batches */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-[#338291] to-[#2a6d7a] border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Associated Batches</h2>
          <Button
            size="sm"
            onClick={() => navigate('/admin/batches', { state: { productId: id } })}
            className="bg-white text-[#338291] hover:bg-gray-100"
          >
            <Package className="h-4 w-4 mr-2" />
            View All Batches
          </Button>
        </div>
        
        <div className="p-6">
          {product.batches && product.batches.length > 0 ? (
            <div className="space-y-3">
              {product.batches.map((batch) => (
                <div 
                  key={batch.batch_id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/admin/batches/${batch.batch_id}`)}
                >
                  <div>
                    <p className="font-medium text-gray-900">{batch.batch_code}</p>
                    <p className="text-sm text-gray-500">
                      Expiry: {batch.expiry_date ? new Date(batch.expiry_date).toLocaleDateString('en-GB') : '-'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Serial Numbers</p>
                    <p className="font-medium text-gray-900">{batch.serial_count || 0}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No batches created for this product yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
