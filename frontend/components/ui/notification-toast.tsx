"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

export const NotificationToastProvider = ToastPrimitives.Provider

export const NotificationToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed bottom-0 right-0 z-[200] flex max-h-screen w-full flex-col p-4 sm:max-w-[380px] sm:flex-col",
      className
    )}
    {...props}
  />
))
NotificationToastViewport.displayName =
  ToastPrimitives.Viewport.displayName

export const NotificationToast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Root
    ref={ref}
    className={cn(
      "pointer-events-auto relative flex w-full flex-col space-y-2 overflow-hidden rounded-md border bg-background p-4 shadow-lg transition-all",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=open]:slide-in-from-bottom-full data-[state=closed]:slide-out-to-right-full",
      className
    )}
    {...props}
  />
))
NotificationToast.displayName = ToastPrimitives.Root.displayName

export const NotificationToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
))
NotificationToastTitle.displayName =
  ToastPrimitives.Title.displayName

export const NotificationToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
NotificationToastDescription.displayName =
  ToastPrimitives.Description.displayName

export const NotificationToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-muted-foreground/70 transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
    )}
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
NotificationToastClose.displayName =
  ToastPrimitives.Close.displayName
