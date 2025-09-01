// Temporary stub component for EmployeeAnalyticsChart
// TODO: Replace with actual recharts implementation after fixing es-toolkit issues

export function EmployeeAnalyticsChart({ data }: { data?: any[] }) {
  return (
    <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-700">Employee Analytics Chart</h3>
        <p className="text-gray-500 text-sm">Chart temporarily disabled</p>
        {data && (
          <p className="text-xs text-gray-400 mt-2">
            Data points: {data.length}
          </p>
        )}
      </div>
    </div>
  )
}