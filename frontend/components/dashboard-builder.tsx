"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, LineChart, PieChart, Table, Gauge } from "lucide-react"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"

interface DashboardBuilderProps {
  addConsoleOutput: (message: string) => void
}

interface DashboardItem {
  id: string
  type: string
  title: string
}

export function DashboardBuilder({ addConsoleOutput }: DashboardBuilderProps) {
  const [dataSource, setDataSource] = useState("")
  const [dashboardItems, setDashboardItems] = useState<DashboardItem[]>([])

  const handleDataSourceConnect = () => {
    // In a real application, you would connect to the data source here
    addConsoleOutput(`Connected to data source: ${dataSource}`)
  }

  const addDashboardItem = (type: string) => {
    const newItem: DashboardItem = {
      id: `item-${dashboardItems.length + 1}`,
      type,
      title: `New ${type} chart`,
    }
    setDashboardItems([...dashboardItems, newItem])
    addConsoleOutput(`Added new dashboard item: ${type}`)
  }

  const onDragEnd = (result) => {
    if (!result.destination) {
      return
    }

    const items = Array.from(dashboardItems)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setDashboardItems(items)
  }

  const renderChartPreview = (type: string) => {
    switch (type) {
      case "bar":
        return <BarChart className="h-full w-full" />
      case "line":
        return <LineChart className="h-full w-full" />
      case "pie":
        return <PieChart className="h-full w-full" />
      case "table":
        return <Table className="h-full w-full" />
      case "gauge":
        return <Gauge className="h-full w-full" />
      default:
        return null
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Dashboard Builder</CardTitle>
        <CardDescription>Connect data sources and create custom dashboards</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="data-source">Data Source</Label>
            <div className="flex space-x-2">
              <Input
                id="data-source"
                value={dataSource}
                onChange={(e) => setDataSource(e.target.value)}
                placeholder="Enter data source URL or name"
              />
              <Button onClick={handleDataSourceConnect}>Connect</Button>
            </div>
          </div>
          <div>
            <Label>Add Dashboard Item</Label>
            <div className="flex space-x-2 mt-2">
              <Button onClick={() => addDashboardItem("bar")}>Bar Chart</Button>
              <Button onClick={() => addDashboardItem("line")}>Line Chart</Button>
              <Button onClick={() => addDashboardItem("pie")}>Pie Chart</Button>
              <Button onClick={() => addDashboardItem("table")}>Table</Button>
              <Button onClick={() => addDashboardItem("gauge")}>Gauge</Button>
            </div>
          </div>
          <div>
            <Label>Dashboard Preview</Label>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="dashboard">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4 mt-2">
                    {dashboardItems.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="border rounded p-4"
                          >
                            <h3 className="font-semibold mb-2">{item.title}</h3>
                            <div className="h-40 bg-gray-100 flex items-center justify-center">
                              {renderChartPreview(item.type)}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
