import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
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
  const [products, setProducts] = useState([])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    defaultValues: {
      batch_code: "",
      product_id: "",
      expiry_date: ""
    }
  })

  useEffect(() => {
    fetchProducts()
    if (isEdit) fetchBatch()
  }, [id])

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get('/admin/products', { params: { limit: 100 } })
      setProducts(response.data.products || [])
    } catch {
      toast({ title: "Error", description: "Failed to load products", variant: "destructive" })
    }
  }

  const fetchBatch = async () => {
    try {
      const response = await apiClient.get(`/admin/batches/${id}`)
      const b = response.data
      reset({
        batch_code: b.batch_code || "",
        product_id: b.product?.product_id ? String(b.product.product_id) : "",
        expiry_date: b.expiry_date ? b.expiry_date.split('T')[0] : ""
      })
    } catch {
      toast({ title: "Error", description: "Failed to load batch details", variant: "destructive" })
      navigate('/admin/batches')
    }
  }

  const onSubmit = async (data) => {
    try {
      const payload = {
        batch_code: data.batch_code,
        product_id: parseInt(data.product_id, 10),
        expiry_date: data.expiry_date
      }

      if (isEdit) {
        await apiClient.put(`/admin/batches/${id}`, payload)
        toast({ title: "Success", description: "Batch updated successfully", variant: "success" })
      } else {
        await apiClient.post('/admin/batches', payload)
        toast({ title: "Success", description: "Batch created successfully", variant: "success" })
      }
      navigate("/admin/batches")
    } catch (error) {
      toast({ title: "Error", description: error.message || "Failed to save batch", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/admin/batches")} className="border-gray-300">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            {isEdit ? "Edit Batch" : "Add New Batch"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isEdit ? "Update batch information" : "Create a new batch"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-[#11b5b2] to-[#0fa09d] border-b">
            <h2 className="text-lg font-semibold text-white">Batch Information</h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch Code <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register("batch_code", {
                    required: "Batch code is required",
                    minLength: { value: 2, message: "Batch code must be at least 2 characters" }
                  })}
                  className={errors.batch_code ? 'border-red-500' : 'border-gray-300'}
                  placeholder="e.g. BATCH-2026-001"
                />
                {errors.batch_code && <p className="mt-1 text-sm text-red-600">{errors.batch_code.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("product_id", { required: "Product is required" })}
                  className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#11b5b2] focus:border-transparent ${
                    errors.product_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">{products.length === 0 ? 'Loading products...' : 'Select a product'}</option>
                  {products.map(p => (
                    <option key={p.product_id} value={String(p.product_id)}>
                      {p.name} ({p.product_code})
                    </option>
                  ))}
                </select>
                {errors.product_id && <p className="mt-1 text-sm text-red-600">{errors.product_id.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register("expiry_date", {
                    required: "Expiry date is required",
                    pattern: { value: /^\d{4}-\d{2}-\d{2}$/, message: "Must be YYYY-MM-DD" }
                  })}
                  type="date"
                  className={errors.expiry_date ? 'border-red-500' : 'border-gray-300'}
                />
                {errors.expiry_date && <p className="mt-1 text-sm text-red-600">{errors.expiry_date.message}</p>}
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate("/admin/batches")} className="border-gray-300 w-full sm:w-auto" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#11b5b2] hover:bg-[#0fa09d] text-white w-full sm:w-auto" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Saving..." : isEdit ? "Update Batch" : "Create Batch"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
