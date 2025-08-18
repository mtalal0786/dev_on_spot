"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Device {
  id: string
  name: string
  os: string
  version: string
}

const availableDevices: Device[] = [
  { id: "1", name: "iPhone 12", os: "iOS", version: "14.5" },
  { id: "2", name: "Samsung Galaxy S21", os: "Android", version: "11" },
  { id: "3", name: "Google Pixel 5", os: "Android", version: "12" },
  { id: "4", name: "iPad Air", os: "iPadOS", version: "14.6" },
  { id: "5", name: "OnePlus 9", os: "Android", version: "11" },
  { id: "6", name: "iPhone SE (2nd gen)", os: "iOS", version: "15.0" },
  { id: "7", name: "Xiaomi Mi 11", os: "Android", version: "11" },
  { id: "8", name: "Samsung Galaxy Tab S7", os: "Android", version: "11" },
]

interface RealDeviceSelectorProps {
  onDeviceSelect: (device: Device) => void
}

export function RealDeviceSelector({ onDeviceSelect }: RealDeviceSelectorProps) {
  const [selectedDevice, setSelectedDevice] = useState<string>(availableDevices[0].id)

  const handleDeviceChange = (deviceId: string) => {
    setSelectedDevice(deviceId)
    const device = availableDevices.find((d) => d.id === deviceId)
    if (device) {
      onDeviceSelect(device)
    }
  }

  return (
    <div className="space-y-4">
      <Label>Select Real Device</Label>
      <ScrollArea className="h-[200px] w-full rounded-md border p-4">
        <RadioGroup value={selectedDevice} onValueChange={handleDeviceChange}>
          {availableDevices.map((device) => (
            <div key={device.id} className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value={device.id} id={`device-${device.id}`} />
              <Label htmlFor={`device-${device.id}`} className="flex-1">
                <span className="font-medium">{device.name}</span>
                <span className="ml-2 text-sm text-muted-foreground">
                  ({device.os} {device.version})
                </span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </ScrollArea>
    </div>
  )
}
