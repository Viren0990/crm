// Placeholder shown while a leads page loads; mirrors the PageHeader + LeadTable layout
export function LeadTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="flex flex-col h-full min-h-0 p-6 gap-6 animate-pulse" aria-busy="true" aria-label="Loading leads">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div className="space-y-3">
          <div className="h-8 w-56 bg-gray-200 rounded-lg"></div>
          <div className="h-4 w-40 bg-gray-100 rounded-md"></div>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
        {/* Toolbar: search + sort */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-b border-gray-100">
          <div className="h-8 w-48 bg-gray-100 rounded-full"></div>
          <div className="h-8 w-20 bg-gray-100 rounded-full"></div>
        </div>

        {/* Column headers */}
        <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-100 bg-gray-50/50">
          <div className="h-3 w-6 bg-gray-200 rounded"></div>
          <div className="h-3 w-16 bg-gray-200 rounded"></div>
          <div className="h-3 w-24 bg-gray-200 rounded"></div>
          <div className="h-3 w-28 bg-gray-200 rounded"></div>
          <div className="h-3 w-20 bg-gray-200 rounded hidden md:block"></div>
          <div className="h-3 w-20 bg-gray-200 rounded hidden lg:block"></div>
          <div className="h-3 w-16 bg-gray-200 rounded ml-auto"></div>
        </div>

        {/* Rows */}
        <div>
          {[...Array(rows)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3.5 border-b border-gray-50 last:border-0">
              <div className="h-6 w-6 bg-gray-200 rounded-full shrink-0"></div>
              <div className="h-4 w-16 bg-gray-100 rounded shrink-0"></div>
              <div className="space-y-2 w-32 shrink-0">
                <div className="h-4 w-full bg-gray-200 rounded"></div>
                <div className="h-3 w-2/3 bg-gray-100 rounded"></div>
              </div>
              <div className="space-y-2 w-36 shrink-0">
                <div className="h-4 w-3/4 bg-gray-100 rounded"></div>
                <div className="h-3 w-full bg-gray-100 rounded"></div>
              </div>
              <div className="h-4 w-20 bg-gray-100 rounded hidden md:block"></div>
              <div className="h-6 w-24 bg-gray-100 rounded-full hidden lg:block"></div>
              <div className="h-7 w-20 bg-gray-200 rounded-xl ml-auto shrink-0"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
