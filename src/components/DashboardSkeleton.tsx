'use client';

export default function DashboardSkeleton() {
  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      {/* Header Skeleton */}
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="w-24 h-5 bg-gray-200 rounded animate-pulse hidden sm:block"></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-32 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="w-20 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Greeting Skeleton */}
        <div className="w-48 h-8 bg-gray-200 rounded animate-pulse mb-6"></div>

        {/* Usage Indicator Skeleton */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="w-48 h-5 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-32 h-3 bg-gray-200 rounded animate-pulse mt-2"></div>
            </div>
          </div>
          <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Upload Section Skeleton */}
        <div className="bg-white rounded-xl border-2 border-dashed border-[#E5E7EB] p-6 sm:p-8 mb-6">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse mb-4"></div>
            <div className="w-48 h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="w-40 h-4 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="w-32 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Lectures List Skeleton */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-[#E5E7EB]">
            <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="divide-y divide-[#E5E7EB]">
            {[1, 2, 3].map((i) => (
              <div key={i} className="px-4 sm:px-6 py-4 flex items-center justify-between">
                <div>
                  <div className="w-48 h-5 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="w-20 h-6 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
