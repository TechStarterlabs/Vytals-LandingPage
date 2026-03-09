import { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function RewardForm() {
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
      reward_name: "",
      reward_type: "Discount Code",
      value: "",
      description: "",
      status: "Active"
    }
  })

  useEffect(() => {
    if (isEdit) {
      fetchReward()
    }
  }, [id])

  const fetchReward = async () => {
    try {
      // TODO: Replace with actual API call
      // const data = await apiClient.get(`/admin/rewards/${id}`)
      // reset(data.data)
      
      // Mock data
      reset({
        reward_name: "10% Discount",
        reward_type: "Discount Code",
        value: "10",
        description: "Get 10% off on your next purchase",
        status: "Active"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load reward details",
        variant: "destructive"
      })
    }
  }

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        // await apiClient.put(`/admin/rewards/${id}`, data)
        toast({
          title: "Success",
          description: "Reward updated successfully",
          variant: "success"
        })
      } else {
        // await apiClient.post('/admin/rewards', data)
        toast({
          title: "Success",
          description: "Reward created successfully",
          variant: "success"
        })
      }
      navigate("/admin/rewards")
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to save reward",
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
          onClick={() => navigate("/admin/rewards")}
          className="border-gray-300"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            {isEdit ? "Edit Reward" : "Add New Reward"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isEdit ? "Update reward information" : "Create a new reward"}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-[#11b5b2] to-[#0fa09d] border-b">
            <h2 className="text-lg font-semibold text-white">Reward Information</h2>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Reward Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reward Name <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register("reward_name", {
                    required: "Reward name is required",
                    minLength: {
                      value: 3,
                      message: "Reward name must be at least 3 characters"
                    }
                  })}
                  className={errors.reward_name ? 'border-red-500' : 'border-gray-300'}
                  placeholder="Enter reward name"
                />
                {errors.reward_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.reward_name.message}</p>
                )}
              </div>

              {/* Reward Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reward Type <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("reward_type", { required: "Reward type is required" })}
                  className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#11b5b2] focus:border-transparent ${
                    errors.reward_type ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="Discount Code">Discount Code</option>
                  <option value="Free Product">Free Product</option>
                  <option value="Cashback">Cashback</option>
                </select>
                {errors.reward_type && (
                  <p className="mt-1 text-sm text-red-600">{errors.reward_type.message}</p>
                )}
              </div>

              {/* Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Value (%) <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register("value", {
                    required: "Value is required",
                    min: {
                      value: 1,
                      message: "Value must be at least 1"
                    },
                    max: {
                      value: 100,
                      message: "Value cannot exceed 100"
                    }
                  })}
                  type="number"
                  className={errors.value ? 'border-red-500' : 'border-gray-300'}
                  placeholder="Enter value"
                />
                {errors.value && (
                  <p className="mt-1 text-sm text-red-600">{errors.value.message}</p>
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

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  {...register("description")}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#11b5b2] focus:border-transparent"
                  placeholder="Enter reward description"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/rewards")}
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
              {isSubmitting ? "Saving..." : isEdit ? "Update Reward" : "Create Reward"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
