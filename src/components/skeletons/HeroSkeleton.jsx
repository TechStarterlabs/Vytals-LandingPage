import { Skeleton } from "@/components/ui/skeleton"

export default function HeroSkeleton() {
  return (
    <div className="relative min-h-screen px-4 py-20">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="text-center space-y-4">
          <Skeleton className="h-16 w-3/4 mx-auto" />
          <Skeleton className="h-8 w-1/2 mx-auto" />
          <Skeleton className="h-12 w-48 mx-auto mt-8" />
        </div>
      </div>
    </div>
  )
}
