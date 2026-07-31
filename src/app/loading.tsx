export default function Loading() {
  return (
    <div className="flex flex-col h-full overflow-hidden p-6 gap-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div className="space-y-3">
          <div className="h-8 w-48 bg-gray-200 rounded-lg"></div>
          <div className="h-4 w-72 bg-gray-100 rounded-md"></div>
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded-xl"></div>
      </div>

      {/* Main Content Skeleton (Table/Dashboard placeholder) */}
      <div className="flex-1 min-h-0 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden p-4">
        {/* Tabs/Toolbar skeleton */}
        <div className="flex gap-2 mb-6 border-b border-gray-100 pb-4">
          <div className="h-8 w-20 bg-gray-200 rounded-full"></div>
          <div className="h-8 w-24 bg-gray-100 rounded-full"></div>
          <div className="h-8 w-24 bg-gray-100 rounded-full"></div>
          <div className="h-8 w-32 bg-gray-100 rounded-full"></div>
        </div>

        {/* List Items Skeleton */}
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
                <div className="h-3 w-1/3 bg-gray-100 rounded"></div>
              </div>
              <div className="h-6 w-20 bg-gray-100 rounded-full"></div>
              <div className="h-6 w-24 bg-gray-100 rounded-full"></div>
              <div className="h-4 w-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
