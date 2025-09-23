"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { Bell } from "lucide-react"
import { cn } from "@/lib/utils"

export type Notification = {
  id: number
  title: string
  description?: string
  createdAt: number
}

const NotificationContext = React.createContext<{
  notify: (n: Omit<Notification, "id" | "createdAt">) => void
} | null>(null)

export function useNotificationToast() {
  const ctx = React.useContext(NotificationContext)
  if (!ctx) throw new Error("useNotificationToast must be used within NotificationToaster")
  return ctx
}

export function NotificationToaster() {
  const [items, setItems] = React.useState<Notification[]>([])

  const notify = React.useCallback(
    (n: Omit<Notification, "id" | "createdAt">) => {
      setItems((prev) => [
        ...prev,
        { id: Date.now(), createdAt: Date.now(), ...n },
      ])
    },
    []
  )

  const remove = (id: number) =>
    setItems((prev) => prev.filter((i) => i.id !== id))

  return (
    <NotificationContext.Provider value={{ notify }}>
      <ToastPrimitives.Provider swipeDirection="right">
        {/* Bottom-right, roomier, no overlap with top-center Toaster */}
        <ToastPrimitives.Viewport
          className={cn(
            "fixed z-[1000] bottom-6 right-6 flex w-[min(92vw,600px)] flex-col gap-4 p-0"
          )}
        />
        {items.map((n) => (
          <ToastPrimitives.Root
            key={n.id}
            duration={6500}
            onOpenChange={(open) => !open && remove(n.id)}
            className={cn(
              // bigger and cleaner panel
              "pointer-events-auto relative w-full overflow-hidden rounded-xl",
              "border border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70",
              "shadow-2xl p-5",
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=closed]:fade-out-80 data-[state=open]:fade-in-80",
              "data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-right-4"
            )}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-md border bg-muted/40 p-2">
                <Bell className="h-5 w-5 text-foreground/80" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-base font-semibold">{n.title}</div>
                {n.description ? (
                  <div className="mt-1 text-sm text-muted-foreground">
                    {n.description}
                  </div>
                ) : null}
              </div>
            </div>
          </ToastPrimitives.Root>
        ))}
      </ToastPrimitives.Provider>
    </NotificationContext.Provider>
  )
}
