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

  useEffect(() => { fetchProduct() }, [id])

  const fetchProduct = async () => {
    try {
      const response = await apiClient.get(`/admin/products/${id}`)
      setProduct(response.data)
    } catch (error) {
      toast({ title: "Error", description: "Failed to load product details", variant: "destructive" })
      navigate('/admin/products')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Loading...</div></div>
  if (!product) return null

  const primaryImage = product.images?.[0]

  return (
    <PermissionRoute permission="products.view">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate("/admin/products")} className="border-gray-300">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Product Details</h1>
              <p className="text-sm text-gray-500 mt-1">View product information</p>
            </div>
          </div>
          {canUpdate('products') && (
            <Button onClick={() => navigate(`/admin/products/${id}/edit`)} className="bg-[#11b5b2] hover:bg-[#0fa09d] text-white">
              <Edit className="h-4 w-4 mr-2" /> Edit Product
            </Button>
          )}
        </div>

        {/* Main info + image */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-[#11b5b2] to-[#0fa09d] border-b">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Package className="h-5 w-5" /> Product Information
            </h2>
          </div>
          <div className="p-6 flex flex-col md:flex-row gap-6">
            {/* Image */}
            {primaryImage ? (
              <div className="flex-shrink-0">
                <img
                  src={primaryImage.url}
                  alt={primaryImage.alt || product.name}
                  className="w-48 h-48 object-cover rounded-lg border border-gray-200"
                />
              </div>
            ) : (
              <div className="flex-shrink-0 w-48 h-48 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                <Package className="h-12 w-12 text-gray-300" />
              </div>
            )}

            {/* Fields */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Product Code (SKU)</label>
                <p className="text-base font-semibold text-gray-900">{product.product_code}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Product Name</label>
                <p className="text-base font-semibold text-gray-900">{product.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Vendor</label>
                <p className="text-base text-gray-900">{product.vendor || '—'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Product Type</label>
                <p className="text-base text-gray-900">{product.product_type || '—'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                }`}>
                  {product.status || '—'}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Total Batches</label>
                <p className="text-base text-gray-900">{product.batch_count || 0}</p>
              </div>
              {product.tags?.length > 0 && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, i) => (
                      <span key={i} className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
              {product.description && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
                  <div className="text-sm text-gray-700 prose max-w-none" dangerouslySetInnerHTML={{ __html: product.description }} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Images gallery */}
        {product.images?.length > 1 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">All Images</h3>
            <div className="flex flex-wrap gap-3">
              {product.images.map((img, i) => (
                <img key={i} src={img.url} alt={img.alt || `Image ${i + 1}`}
                  className="w-24 h-24 object-cover rounded-lg border border-gray-200" />
              ))}
            </div>
          </div>
        )}

        {/* Variants */}
        {product.variants?.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Variants</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Title', 'SKU', 'Price', 'Barcode', 'Inventory Policy'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {product.variants.map((v, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 text-gray-900">{v.title}</td>
                      <td className="px-4 py-3 font-mono text-gray-700">{v.sku || '—'}</td>
                      <td className="px-4 py-3 text-gray-900">₹{v.price}</td>
                      <td className="px-4 py-3 text-gray-600">{v.barcode || '—'}</td>
                      <td className="px-4 py-3 text-gray-600 capitalize">{v.inventory_policy || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Batches */}
        {product.batches?.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Batches ({product.batches.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Batch Code', 'Expiry Date', 'Serials'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {product.batches.map((b, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 font-mono text-gray-900">{b.batch_code}</td>
                      <td className="px-4 py-3 text-gray-700">{b.expiry_date || '—'}</td>
                      <td className="px-4 py-3 text-gray-700">{b.serial_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Sync info */}
        {product.shopify_synced_at && (
          <p className="text-xs text-gray-400 text-right">
            Last synced from Shopify: {new Date(product.shopify_synced_at).toLocaleString()}
          </p>
        )}
      </div>
    </PermissionRoute>
  )
}
