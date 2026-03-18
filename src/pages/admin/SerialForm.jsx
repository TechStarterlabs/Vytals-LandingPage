import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function SerialForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const isEdit = id && id !== 'new'
  const [batches, setBatches] = useState([])
  const [loadingBatches, setLoadingBatches] = useState(true)
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    defaultValues: {
      serial_number: "",
      batch_id: "",
      status: "Available"
    }
  })

  useEffect(() => {
    fetchBatches()
    if (isEdit) {
      fetchSerial()
    }
  }, [id])

  const fetchBatches = async () => {
    try {
      const response = await apiClient.get('/admin/batches?limit=100')
      setBatches(response.data.batches || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load batches",
        variant: "destructive"
      })
    } finally {
      setLoadingBatches(false)
    }
  }

  const fetchSerial = async () => {
    try {
      const response = await apiClient.get(`/admin/serials/${id}`)
      reset(response.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load serial details",
        variant: "destructive"
      })
    }
  }

  const onSubmit = async (data) => {
    try {
      // Convert batch_id to number
      const formData = {
        ...data,
        batch_id: parseInt(data.batch_id)
      }

      if (isEdit) {
        await apiClient.put(`/admin/serials/${id}`, formData)
        toast({
          title: "Success",
          description: "Serial number updated successfully",
          variant: "success"
        })
      } else {
        await apiClient.post('/admin/serials', formData)
        toast({
          title: "Success",
          description: "Serial number created successfully",
          variant: "success"
        })
      }
      navigate("/admin/serials")
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to save serial number",
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
          onClick={() => navigate("/admin/serials")}
          className="border-gray-300"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            {isEdit ? "Edit Serial Number" : "Add New Serial Number"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isEdit ? "Update serial number information" : "Create a new serial number"}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-[#11b5b2] to-[#0fa09d] border-b">
            <h2 className="text-lg font-semibold text-white">Serial Number Information</h2>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Serial Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Serial Number <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register("serial_number", {
                    required: "Serial number is required",
                    minLength: {
                      value: 5,
                      message: "Serial number must be at least 5 characters"
                    }
                  })}
                  className={errors.serial_number ? 'border-red-500' : 'border-gray-300'}
                  placeholder="Enter serial number"
                  disabled={isEdit}
                />
                {errors.serial_number && (
                  <p className="mt-1 text-sm text-red-600">{errors.serial_number.message}</p>
                )}
              </div>

              {/* Batch */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("batch_id", { required: "Batch is required" })}
                  className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#11b5b2] focus:border-transparent ${
                    errors.batch_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loadingBatches}
                >
                  <option value="">
                    {loadingBatches ? "Loading batches..." : "Select Batch"}
                  </option>
                  {batches.map((batch) => (
                    <option key={batch.batch_id} value={batch.batch_id}>
                      {batch.batch_code} - {batch.product?.name || 'Unknown Product'}
                    </option>
                  ))}
                </select>
                {errors.batch_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.batch_id.message}</p>
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
                  <option value="Available">Available</option>
                  <option value="Scanned">Scanned</option>
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
              onClick={() => navigate("/admin/serials")}
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
              {isSubmitting ? "Saving..." : isEdit ? "Update Serial" : "Create Serial"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
