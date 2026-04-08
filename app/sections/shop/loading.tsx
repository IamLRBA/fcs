import { Skeleton } from '@/components/ui/Skeleton'

export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-unified relative overflow-hidden pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-24 w-24 rounded-2xl" />
          <Skeleton className="h-10 w-64 rounded-lg" />
          <Skeleton className="h-5 w-80 rounded-lg" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-8 w-56 mx-auto rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-44 w-full rounded-2xl" />
            <Skeleton className="h-44 w-full rounded-2xl" />
            <Skeleton className="h-44 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
