import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function ProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const isEdit = id && id !== 'new'
  
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    product_code: "",
    name: "",
    pack_type: "",
    pack_size: ""
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isEdit) {
      fetchProduct()
    }
  }, [id])

  const fetchProduct = async () => {
    try {
      const response = await apiClient.get(`/admin/products/${id}`)
      setFormData({
        product_code: response.data.product_code || "",
        name: response.data.name || "",
        pack_type: response.data.pack_type || "",
        pack_size: response.data.pack_size || ""
      })
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

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.product_code.trim()) {
      newErrors.product_code = "Product code is required"
    } else if (!/^[A-Z0-9]+$/.test(formData.product_code)) {
      newErrors.product_code = "Product code must be uppercase alphanumeric (e.g., VSR001)"
    }
    
    if (!formData.name.trim()) {
      newErrors.name = "Product name is required"
    } else if (formData.name.length < 3) {
      newErrors.name = "Product name must be at least 3 characters"
    }
    
    if (!formData.pack_type.trim()) {
      newErrors.pack_type = "Pack type is required"
    }
    
    if (!formData.pack_size.trim()) {
      newErrors.pack_size = "Pack size is required"
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
      if (isEdit) {
        await apiClient.put(`/admin/products/${id}`, formData)
        toast({
          title: "Success",
          description: "Product updated successfully",
          variant: "success"
        })
      } else {
        await apiClient.post('/admin/products', formData)
        toast({
          title: "Success",
          description: "Product created successfully",
          variant: "success"
        })
      }
      navigate("/admin/products")
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEdit ? 'update' : 'create'} product`,
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
          onClick={() => navigate("/admin/products")}
          className="border-gray-300"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            {isEdit ? "Edit Product" : "Add New Product"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isEdit ? "Update product information" : "Create a new product"}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-[#338291] to-[#2a6d7a] border-b">
            <h2 className="text-lg font-semibold text-white">Product Information</h2>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Code <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.product_code}
                  onChange={(e) => handleChange('product_code', e.target.value.toUpperCase())}
                  className={`${errors.product_code ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="VSR001"
                  disabled={isEdit}
                />
                {errors.product_code && (
                  <p className="mt-1 text-sm text-red-600">{errors.product_code}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Unique identifier (e.g., VSR001, OM001). Cannot be changed after creation.
                </p>
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Premium Omega-3 Fish Oil"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Pack Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pack Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.pack_type}
                  onChange={(e) => handleChange('pack_type', e.target.value)}
                  className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#338291] focus:border-transparent ${
                    errors.pack_type ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select pack type</option>
                  <option value="Bottle">Bottle</option>
                  <option value="Box">Box</option>
                  <option value="Jar">Jar</option>
                  <option value="Pouch">Pouch</option>
                  <option value="Blister Pack">Blister Pack</option>
                  <option value="Tube">Tube</option>
                </select>
                {errors.pack_type && (
                  <p className="mt-1 text-sm text-red-600">{errors.pack_type}</p>
                )}
              </div>

              {/* Pack Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pack Size <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.pack_size}
                  onChange={(e) => handleChange('pack_size', e.target.value)}
                  className={`${errors.pack_size ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="60 capsules"
                />
                {errors.pack_size && (
                  <p className="mt-1 text-sm text-red-600">{errors.pack_size}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  e.g., "60 capsules", "90 tablets", "500ml"
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
                  <h3 className="text-sm font-medium text-blue-800">Product Information</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Product code must be unique and cannot be changed after creation</li>
                      <li>Use clear, descriptive names for easy identification</li>
                      <li>Pack type and size help customers understand the product</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/products")}
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
              {submitting ? 'Saving...' : (isEdit ? "Update Product" : "Create Product")}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
