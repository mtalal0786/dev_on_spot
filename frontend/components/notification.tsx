"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

interface NotificationProps {
  message: string
  type: "success" | "error" | "info"
  onClose: () => void
}

export function Notification({ message, type, onClose }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose()
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  if (!isVisible) return null

  const bgColor = type === "success" ? "bg-green-500" : type === "error" ? "bg-red-500" : "bg-blue-500"

  return (
    <div className={`fixed bottom-4 right-4 ${bgColor} text-white p-4 rounded-md shadow-lg flex items-center`}>
      <span>{message}</span>
      <button onClick={() => setIsVisible(false)} className="ml-4">
        <X size={18} />
      </button>
    </div>
  )
}
