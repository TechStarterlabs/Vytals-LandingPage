import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Edit, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function RewardView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [reward, setReward] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReward()
  }, [id])

  const fetchReward = async () => {
    try {
      const response = await apiClient.get(`/admin/rewards/${id}`)
      setReward(response.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load reward details",
        variant: "destructive"
      })
      navigate('/admin/rewards')
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

  if (!reward) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
              Reward Details
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              View reward information
            </p>
          </div>
        </div>
        <Button
          onClick={() => navigate(`/admin/rewards/${id}/edit`)}
          className="bg-[#11b5b2] hover:bg-[#0fa09d] text-white"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Reward
        </Button>
      </div>

      {/* Reward Information */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-[#11b5b2] to-[#0fa09d] border-b">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Reward Information
          </h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Reward Name
              </label>
              <p className="text-base font-semibold text-gray-900">
                {reward.reward_name || '-'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Reward Type
              </label>
              <p className="text-base text-gray-900">
                {reward.reward_type || '-'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Value
              </label>
              <p className="text-base text-gray-900">
                {reward.value || '-'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Status
              </label>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                reward.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {reward.status || 'Unknown'}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Total Issued
              </label>
              <p className="text-base text-gray-900">
                {reward.total_issued || 0}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Total Redeemed
              </label>
              <p className="text-base text-gray-900">
                {reward.total_redeemed || 0}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Created At
              </label>
              <p className="text-base text-gray-900">
                {reward.created_at ? new Date(reward.created_at).toLocaleString() : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
