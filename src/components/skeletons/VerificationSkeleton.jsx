import { Skeleton } from "@/components/ui/skeleton"

export default function VerificationSkeleton() {
  return (
    <div className="px-4 py-20">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="text-center space-y-3">
          <Skeleton className="h-12 w-64 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
        
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  )
}
