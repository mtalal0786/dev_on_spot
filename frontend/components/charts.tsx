import { BarChartIcon, LineChartIcon } from "lucide-react"

export function BarChart() {
  return (
    <div className="h-64 w-full flex items-center justify-center bg-muted">
      <BarChartIcon className="h-16 w-16 text-muted-foreground" />
      <span className="ml-2 text-muted-foreground">Bar Chart Placeholder</span>
    </div>
  )
}

export function LineChart() {
  return (
    <div className="h-64 w-full flex items-center justify-center bg-muted">
      <LineChartIcon className="h-16 w-16 text-muted-foreground" />
      <span className="ml-2 text-muted-foreground">Line Chart Placeholder</span>
    </div>
  )
}
