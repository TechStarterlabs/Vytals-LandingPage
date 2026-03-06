import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function BatchForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const isEdit = id && id !== 'new'
  
  const [loading, setLoading] = useState(true)  // Always start with loading true
  const [submitting, setSubmitting] = useState(false)
  const [products, setProducts] = useState([])
  const [formData, setFormData] = useState({
    batch_code: "",
    product_id: "",
    expiry_date: ""
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const initializeForm = async () => {
      await fetchProducts()
      if (isEdit) {
        await fetchBatch()
      } else {
        setLoading(false)
      }
    }
    
    initializeForm()
  }, [id, isEdit])

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get('/admin/products')
      const productsList = response.data.products || []
      setProducts(productsList)
      console.log('Products loaded:', productsList.length)
      return productsList
    } catch (error) {
      console.error('Failed to fetch products:', error)
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive"
      })
      return []
    }
  }

  const fetchBatch = async () => {
    try {
      const response = await apiClient.get(`/admin/batches/${id}`)
      const batchData = response.data
      
      console.log('Batch data loaded:', batchData)
      
      // Extract product_id from nested product object
      const productId = batchData.product?.product_id || batchData.product_id || ""
      
      const formValues = {
        batch_code: batchData.batch_code || "",
        product_id: productId ? String(productId) : "",
        expiry_date: batchData.expiry_date ? batchData.expiry_date.split('T')[0] : ""
      }
      
      console.log('Setting form data:', formValues)
      setFormData(formValues)
    } catch (error) {
      console.error('Failed to fetch batch:', error)
      toast({
        title: "Error",
        description: "Failed to load batch details",
        variant: "destructive"
      })
      navigate('/admin/batches')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.batch_code.trim()) {
      newErrors.batch_code = "Batch code is required"
    } else if (!/^[A-Z0-9-]+$/.test(formData.batch_code)) {
      newErrors.batch_code = "Batch code must be uppercase alphanumeric with hyphens (e.g., AAAAB01)"
    }
    
    if (!formData.product_id) {
      newErrors.product_id = "Product is required"
    }
    
    if (!formData.expiry_date) {
      newErrors.expiry_date = "Expiry date is required"
    } else {
      const expiryDate = new Date(formData.expiry_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (expiryDate < today) {
        newErrors.expiry_date = "Expiry date must be in the future"
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive"
      })
      return
    }

    setSubmitting(true)

    try {
      // Convert product_id to number for API
      const payload = {
        ...formData,
        product_id: parseInt(formData.product_id, 10)
      }

      if (isEdit) {
        await apiClient.put(`/admin/batches/${id}`, payload)
        toast({
          title: "Success",
          description: "Batch updated successfully",
          variant: "success"
        })
      } else {
        await apiClient.post('/admin/batches', payload)
        toast({
          title: "Success",
          description: "Batch created successfully",
          variant: "success"
        })
      }
      navigate("/admin/batches")
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEdit ? 'update' : 'create'} batch`,
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/admin/batches")}
          className="border-gray-300"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            {isEdit ? "Edit Batch" : "Add New Batch"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isEdit ? "Update batch information" : "Create a new production batch"}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-[#338291] to-[#2a6d7a] border-b">
            <h2 className="text-lg font-semibold text-white">Batch Information</h2>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Batch Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch Code <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.batch_code}
                  onChange={(e) => handleChange('batch_code', e.target.value.toUpperCase())}
                  className={`${errors.batch_code ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="AAAAB01"
                  disabled={isEdit}
                />
                {errors.batch_code && (
                  <p className="mt-1 text-sm text-red-600">{errors.batch_code}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Unique identifier (e.g., AAAAB01, BATCH-001). Cannot be changed after creation.
                </p>
              </div>

              {/* Product */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.product_id}
                  onChange={(e) => handleChange('product_id', e.target.value)}
                  className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#338291] focus:border-transparent ${
                    errors.product_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isEdit || products.length === 0}
                >
                  <option value="">
                    {products.length === 0 ? 'Loading products...' : 'Select a product'}
                  </option>
                  {products.map((product) => (
                    <option key={product.product_id} value={String(product.product_id)}>
                      {product.product_code} - {product.name}
                    </option>
                  ))}
                </select>
                {errors.product_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.product_id}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {isEdit ? "Product cannot be changed after creation" : "Select the product this batch belongs to"}
                </p>
                {/* Debug info - remove after testing */}
                {isEdit && formData.product_id && (
                  <p className="mt-1 text-xs text-blue-600">
                    Selected product ID: {formData.product_id} (Total products: {products.length})
                  </p>
                )}
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => handleChange('expiry_date', e.target.value)}
                  className={`${errors.expiry_date ? 'border-red-500' : 'border-gray-300'}`}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.expiry_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.expiry_date}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Date when this batch expires
                </p>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Batch Information</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Batch code must be unique and cannot be changed after creation</li>
                      <li>Each batch is linked to a specific product</li>
                      <li>Expiry date determines when the batch becomes inactive</li>
                      <li>After creating a batch, you can add serial numbers to it</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps Info */}
            {!isEdit && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Next Steps</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>After creating this batch, you can:</p>
                      <ul className="list-disc list-inside space-y-1 mt-1">
                        <li>Generate serial numbers for this batch</li>
                        <li>Upload Certificate of Analysis (COA)</li>
                        <li>Monitor verification statistics</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/batches")}
              className="border-gray-300"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#338291] hover:bg-[#2a6d7a] text-white"
              disabled={submitting}
            >
              <Save className="h-4 w-4 mr-2" />
              {submitting ? 'Saving...' : (isEdit ? "Update Batch" : "Create Batch")}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
