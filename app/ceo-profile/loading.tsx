import { Skeleton } from '@/components/ui/Skeleton'

export default function CEOProfileLoading() {
  return (
    <div className="min-h-screen bg-unified relative overflow-hidden pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-36 w-36 rounded-full" />
          <Skeleton className="h-10 w-56 rounded-lg" />
          <Skeleton className="h-5 w-72 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 gap-6">
          <Skeleton className="h-72 w-full rounded-2xl" />
          <div className="flex justify-center gap-3">
            <Skeleton className="h-14 w-14 rounded-xl" />
            <Skeleton className="h-14 w-14 rounded-xl" />
            <Skeleton className="h-14 w-14 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
