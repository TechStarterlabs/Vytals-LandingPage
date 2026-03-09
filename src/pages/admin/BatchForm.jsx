import { useEffect } from "react"
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
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    defaultValues: {
      batch_code: "",
      product_id: "",
      quantity: "",
      manufactured_date: "",
      expiry_date: "",
      status: "Active"
    }
  })

  useEffect(() => {
    if (isEdit) {
      fetchBatch()
    }
  }, [id])

  const fetchBatch = async () => {
    try {
      // TODO: Replace with actual API call
      // const data = await apiClient.get(`/admin/batches/${id}`)
      // reset(data.data)
      
      // Mock data
      reset({
        batch_code: "BATCH001",
        product_id: "1",
        quantity: "1000",
        manufactured_date: "2026-01-01",
        expiry_date: "2027-01-01",
        status: "Active"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load batch details",
        variant: "destructive"
      })
    }
  }

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        // await apiClient.put(`/admin/batches/${id}`, data)
        toast({
          title: "Success",
          description: "Batch updated successfully",
          variant: "success"
        })
      } else {
        // await apiClient.post('/admin/batches', data)
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
        description: error.message || "Failed to save batch",
        variant: "destructive"
      })
    }
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            {isEdit ? "Edit Batch" : "Add New Batch"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isEdit ? "Update batch information" : "Create a new batch"}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-[#11b5b2] to-[#0fa09d] border-b">
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
                  {...register("batch_code", {
                    required: "Batch code is required",
                    minLength: {
                      value: 3,
                      message: "Batch code must be at least 3 characters"
                    }
                  })}
                  className={errors.batch_code ? 'border-red-500' : 'border-gray-300'}
                  placeholder="Enter batch code"
                />
                {errors.batch_code && (
                  <p className="mt-1 text-sm text-red-600">{errors.batch_code.message}</p>
                )}
              </div>

              {/* Product */}
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
                  <option value="">Select Product</option>
                  <option value="1">Product A</option>
                  <option value="2">Product B</option>
                  <option value="3">Product C</option>
                </select>
                {errors.product_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.product_id.message}</p>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register("quantity", {
                    required: "Quantity is required",
                    min: {
                      value: 1,
                      message: "Quantity must be at least 1"
                    }
                  })}
                  type="number"
                  className={errors.quantity ? 'border-red-500' : 'border-gray-300'}
                  placeholder="Enter quantity"
                />
                {errors.quantity && (
                  <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
                )}
              </div>

              {/* Manufactured Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manufactured Date <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register("manufactured_date", { required: "Manufactured date is required" })}
                  type="date"
                  className={errors.manufactured_date ? 'border-red-500' : 'border-gray-300'}
                />
                {errors.manufactured_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.manufactured_date.message}</p>
                )}
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register("expiry_date", { required: "Expiry date is required" })}
                  type="date"
                  className={errors.expiry_date ? 'border-red-500' : 'border-gray-300'}
                />
                {errors.expiry_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.expiry_date.message}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("status", { required: "Status is required" })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#11b5b2] focus:border-transparent"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/batches")}
              className="border-gray-300 w-full sm:w-auto"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#11b5b2] hover:bg-[#0fa09d] text-white w-full sm:w-auto"
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Saving..." : isEdit ? "Update Batch" : "Create Batch"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
