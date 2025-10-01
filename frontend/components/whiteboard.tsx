// // File: src/pages/whiteboard.tsx
// // This is the main whiteboard component, enhanced with CanvasApp features.
// // Place this in src/pages/ (Next.js) or src/components/ (React with routing).
// // It includes all CanvasApp features (line height, text rotation, etc.) and maintains existing functionality.
// // Dependencies: npm install uuid lucide-react (and shadcn/ui components: button, input, select, popover, slider).

// "use client"

// import React, { useEffect, useRef, useState, useCallback } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
// import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
// import { Slider } from "@/components/ui/slider"
// import { Pencil, Eraser, Square, Circle as CircleIcon, Type, Save, Undo, Redo, Download, Move, StickyNote, Highlighter as HighlighterIcon, ArrowRight, Triangle, Star, MessageCircle, Minus, Link as LinkIcon } from "lucide-react"
// import { v4 as uuidv4 } from "uuid"
// import StickyNoteComponent from "@/components/StickyNoteComponent" // Import the enhanced StickyNoteComponent
// import "@excalidraw/excalidraw/index.css";
// type Tool = "pointer" | "pen" | "highlighter" | "eraser" | "smart" | "shape" | "text" | "sticky" | "line" | "connection" | "bubble" | "star" | "image"

// type BaseShape = {
//   id: string
//   type: Tool
//   color: string
//   strokeWidth: number
//   createdAt: number
//   updatedAt: number
// }

// type PathPoint = { x: number; y: number }

// type PencilShape = BaseShape & {
//   type: "pen" | "highlighter" | "eraser" | "smart"
//   points: PathPoint[]
//   opacity?: number
// }

// type ShapeType = "rectangle" | "circle" | "triangle" | "diamond" | "arrow" | "parallelogram" | "bubble" | "star" | "connection" | "plain-line" | "single-arrow" | "double-arrow"

// type ShapeShape = BaseShape & {
//   type: "shape"
//   shapeType: ShapeType
//   x: number
//   y: number
//   w: number
//   h: number
//   cx?: number
//   cy?: number
//   r?: number
//   x1?: number
//   y1?: number
//   x2?: number
//   y2?: number
//   x3?: number
//   y3?: number
//   borderWidth?: number
//   borderColor?: string
//   cornerRadius?: number // For rectangles
// }

// type LineShape = BaseShape & {
//   type: "line"
//   x1: number
//   y1: number
//   x2: number
//   y2: number
//   arrow?: "none" | "single" | "double"
// }

// type TextShape = BaseShape & {
//   type: "text"
//   x: number
//   y: number
//   text: string
//   fontSize: number
//   fontFamily: string
//   bold: boolean
//   italic: boolean
//   underline: boolean
//   alignment: "left" | "center" | "right"
//   link?: string
//   lineHeight?: number
//   fontWeight?: string
//   rotation?: number
// }

// type StickyShape = BaseShape & {
//   type: "sticky"
//   x: number
//   y: number
//   w: number
//   h: number
//   html: string
//   bgColor: string
//   textColor?: string
//   resizeLock?: boolean
// }

// type ImageShape = BaseShape & {
//   type: "image"
//   x: number
//   y: number
//   w: number
//   h: number
//   src: string
//   opacity: number
//   showBorder: boolean
//   flipHorizontal: boolean
//   flipVertical: boolean
// }

// type Shape = PencilShape | ShapeShape | LineShape | TextShape | StickyShape | ImageShape

// export function Whiteboard({
//   onSave,
// }: {
//   onSave?: (doc: { shapes: Shape[] }) => void
// }) {
//   const canvasRef = useRef<HTMLCanvasElement>(null)
//   const overlayRef = useRef<HTMLDivElement>(null)
//   const prevPointRef = useRef<PathPoint | null>(null)
//   const viewRef = useRef({ dpr: 1 })
//   const [tool, setTool] = useState<Tool>("pointer")
//   const [shapeType, setShapeType] = useState<ShapeType>("rectangle")
//   const [color, setColor] = useState("#000000")
//   const [bgColor, setBgColor] = useState("#ffff88")
//   const [strokeWidth, setStrokeWidth] = useState(2)
//   const [fontSize, setFontSize] = useState(16)
//   const [fontFamily, setFontFamily] = useState("Arial")
//   const [bold, setBold] = useState(false)
//   const [italic, setItalic] = useState(false)
//   const [underline, setUnderline] = useState(false)
//   const [alignment, setAlignment] = useState<"left" | "center" | "right">("left")
//   const [lineHeight, setLineHeight] = useState<number>(1.5)
//   const [fontWeight, setFontWeight] = useState<string>("normal")
//   const [textRotation, setTextRotation] = useState<number>(0)
//   const [borderWidth, setBorderWidth] = useState<number>(1)
//   const [borderColor, setBorderColor] = useState<string>("#000000")
//   const [cornerRadius, setCornerRadius] = useState<number>(0)
//   const [textColor, setTextColor] = useState<string>("#000000")
//   const [resizeLock, setResizeLock] = useState<boolean>(false)
//   const [opacity, setOpacity] = useState<number>(1)
//   const [showBorder, setShowBorder] = useState<boolean>(false)
//   const [flipHorizontal, setFlipHorizontal] = useState<boolean>(false)
//   const [flipVertical, setFlipVertical] = useState<boolean>(false)
//   const [showLayers, setShowLayers] = useState<boolean>(false)
//   const [showGrid, setShowGrid] = useState<boolean>(false)
//   const [snapToGrid, setSnapToGrid] = useState<boolean>(false)
//   const [shapes, setShapes] = useState<Shape[]>([])
//   const [liveShape, setLiveShape] = useState<Shape | null>(null)
//   const [isDown, setIsDown] = useState(false)
//   const [selectedIds, setSelectedIds] = useState<string[]>([])
//   const [selectedShapes, setSelectedShapes] = useState<Shape[]>([])
//   const [history, setHistory] = useState<Shape[][]>([])
//   const [hi, setHi] = useState(-1)
//   const [zoom, setZoom] = useState(1)
//   const [offset, setOffset] = useState({ x: 0, y: 0 })
//   const [isResizing, setIsResizing] = useState(false)
//   const [resizeHandle, setResizeHandle] = useState<string | null>(null)
//   const [selectionBox, setSelectionBox] = useState<{start: PathPoint, end: PathPoint} | null>(null)
//   const [eraserMode, setEraserMode] = useState<"stroke" | "object">("stroke")
//   const [editingStickyId, setEditingStickyId] = useState<string | null>(null)
//   const [showTextToolbar, setShowTextToolbar] = useState(false)
//   const [editingTextId, setEditingTextId] = useState<string | null>(null)

//   // Set default properties based on tool
//   useEffect(() => {
//     switch (tool) {
//       case "pen":
//       case "smart":
//         setStrokeWidth(2)
//         setOpacity(1)
//         break
//       case "highlighter":
//         setStrokeWidth(10)
//         setOpacity(0.5)
//         break
//       case "eraser":
//         setStrokeWidth(5)
//         setOpacity(1)
//         break
//       case "shape":
//       case "line":
//         setStrokeWidth(2)
//         setBorderWidth(1)
//         setOpacity(1)
//         break
//       case "sticky":
//       case "text":
//         setStrokeWidth(1)
//         setOpacity(1)
//         break
//       case "image":
//         setOpacity(1)
//         setShowBorder(false)
//         setFlipHorizontal(false)
//         setFlipVertical(false)
//         break
//       default:
//         break
//     }
//   }, [tool])

//   // Canvas sizing + HiDPI
//   const resizeCanvas = useCallback(() => {
//     const canvas = canvasRef.current
//     if (!canvas) return
//     const parent = canvas.parentElement!
//     const rect = parent.getBoundingClientRect()
//     const dpr = Math.max(1, window.devicePixelRatio || 1)
//     viewRef.current.dpr = dpr
//     canvas.style.width = `${rect.width}px`
//     canvas.style.height = `${rect.height}px`
//     canvas.width = Math.round(rect.width * dpr)
//     canvas.height = Math.round(rect.height * dpr)
//     const ctx = canvas.getContext("2d")!
//     ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
//     ctx.lineCap = "round"
//     ctx.lineJoin = "round"
//   }, [])

//   useEffect(() => {
//     resizeCanvas()
//     window.addEventListener("resize", resizeCanvas)
//     return () => window.removeEventListener("resize", resizeCanvas)
//   }, [resizeCanvas])

//   // Helpers
//   const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
//     const canvas = canvasRef.current!
//     const rect = canvas.getBoundingClientRect()
//     let x = (e.clientX - rect.left - offset.x) / zoom
//     let y = (e.clientY - rect.top - offset.y) / zoom
//     if (snapToGrid) {
//       const gridSize = 10
//       x = Math.round(x / gridSize) * gridSize
//       y = Math.round(y / gridSize) * gridSize
//     }
//     return { x, y }
//   }

//   const pushHistory = (next: Shape[]) => {
//     setHistory((prev) => {
//       const trimmed = prev.slice(0, hi + 1)
//       const h = [...trimmed, next]
//       setHi(h.length - 1)
//       return h
//     })
//   }

//   const commitLive = (finalShape: Shape | null) => {
//     if (!finalShape) return
//     const next = [...shapes, finalShape]
//     setShapes(next)
//     setLiveShape(null)
//     pushHistory(next)
//   }

//   const updateShapes = (updatedShapes: Shape[]) => {
//     let nextShapes = shapes
//     updatedShapes.forEach(updated => {
//       nextShapes = nextShapes.map(s => s.id === updated.id ? updated : s)
//     })
//     setShapes(nextShapes)
//     pushHistory(nextShapes)
//   }

//   const getBoundingBox = (shape: Shape) => {
//     switch (shape.type) {
//       case "pen":
//       case "highlighter":
//       case "eraser":
//       case "smart": {
//         const pts = (shape as PencilShape).points
//         let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
//         pts.forEach(p => {
//           minX = Math.min(minX, p.x)
//           minY = Math.min(minY, p.y)
//           maxX = Math.max(maxX, p.x)
//           maxY = Math.max(maxY, p.y)
//         })
//         return { x: minX, y: minY, w: maxX - minX, h: maxY - minY }
//       }
//       case "shape": {
//         const s = shape as ShapeShape
//         if (s.shapeType === "circle") {
//           return { x: s.cx! - s.r!, y: s.cy! - s.r!, w: s.r! * 2, h: s.r! * 2 }
//         }
//         return { x: s.x, y: s.y, w: s.w, h: s.h }
//       }
//       case "line": {
//         const l = shape as LineShape
//         const minX = Math.min(l.x1, l.x2)
//         const minY = Math.min(l.y1, l.y2)
//         return { x: minX, y: minY, w: Math.abs(l.x2 - l.x1), h: Math.abs(l.y2 - l.y1) }
//       }
//       case "text": {
//         const ts = shape as TextShape
//         const ctx = canvasRef.current!.getContext("2d")!
//         ctx.font = `${ts.bold ? 'bold' : ''} ${ts.italic ? 'italic' : ''} ${ts.fontSize}px ${ts.fontFamily}`
//         const width = ctx.measureText(ts.text).width
//         return { x: ts.x, y: ts.y - ts.fontSize, w: width, h: ts.fontSize }
//       }
//       case "sticky":
//       case "image": {
//         const s = shape as StickyShape | ImageShape
//         return { x: s.x, y: s.y, w: s.w, h: s.h }
//       }
//     }
//   }

//   const hitTest = (p: PathPoint, shape: Shape): boolean => {
//     const buffer = shape.strokeWidth * 2 + 5
//     const bb = getBoundingBox(shape)
//     return !(p.x < bb.x - buffer || p.x > bb.x + bb.w + buffer || p.y < bb.y - buffer || p.y > bb.y + bb.h + buffer)
//   }

//   const getResizeHandlePosition = (bb: {x: number, y: number, w: number, h: number}, handle: string) => {
//     switch (handle) {
//       case 'top-left':
//         return {x: bb.x, y: bb.y}
//       case 'top':
//         return {x: bb.x + bb.w / 2, y: bb.y}
//       case 'top-right':
//         return {x: bb.x + bb.w, y: bb.y}
//       case 'right':
//         return {x: bb.x + bb.w, y: bb.y + bb.h / 2}
//       case 'bottom-right':
//         return {x: bb.x + bb.w, y: bb.y + bb.h}
//       case 'bottom':
//         return {x: bb.x + bb.w / 2, y: bb.y + bb.h}
//       case 'bottom-left':
//         return {x: bb.x, y: bb.y + bb.h}
//       case 'left':
//         return {x: bb.x, y: bb.y + bb.h / 2}
//       default:
//         return {x: 0, y: 0}
//     }
//   }

//   const hitResizeHandle = (p: PathPoint, shape: Shape, handle: string) => {
//     const bb = getBoundingBox(shape)
//     const size = 8 / zoom
//     const pos = getResizeHandlePosition(bb, handle)
//     return Math.abs(p.x - pos.x) < size / 2 && Math.abs(p.y - pos.y) < size / 2
//   }

//   const isClosedPath = (pts: PathPoint[]) => {
//     if (pts.length < 3) return false
//     const start = pts[0]
//     const end = pts[pts.length - 1]
//     return Math.hypot(start.x - end.x, start.y - end.y) < 20
//   }

//   const recognizeShape = (pts: PathPoint[]): ShapeShape | null => {
//     if (pts.length < 3) return null
//     if (isClosedPath(pts)) {
//       let cx = 0, cy = 0
//       pts.forEach(p => { cx += p.x; cy += p.y })
//       cx /= pts.length
//       cy /= pts.length
//       let r = 0
//       pts.forEach(p => r += Math.hypot(p.x - cx, p.y - cy))
//       r /= pts.length
//       let variance = 0
//       pts.forEach(p => variance += Math.abs(Math.hypot(p.x - cx, p.y - cy) - r))
//       variance /= pts.length
//       if (variance < 10) {
//         return { type: "shape", shapeType: "circle", id: uuidv4(), color, strokeWidth, borderWidth, borderColor, createdAt: Date.now(), updatedAt: Date.now(), cx, cy, r } as ShapeShape
//       }
//       const bb = getBoundingBox({ type: "pen", points: pts } as PencilShape)
//       if (pts.length > 4 && Math.abs(bb.w - bb.h) < 20) {
//         return { type: "shape", shapeType: "rectangle", id: uuidv4(), color, strokeWidth, borderWidth, borderColor, cornerRadius, createdAt: Date.now(), updatedAt: Date.now(), x: bb.x, y: bb.y, w: bb.w, h: bb.h } as ShapeShape
//       }
//       return { type: "shape", shapeType: "rectangle", id: uuidv4(), color, strokeWidth, borderWidth, borderColor, cornerRadius, createdAt: Date.now(), updatedAt: Date.now(), x: bb.x, y: bb.y, w: bb.w, h: bb.h } as ShapeShape
//     }
//     return null
//   }

//   const drawArrowHead = (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, size = 10) => {
//     ctx.beginPath()
//     ctx.moveTo(x, y)
//     ctx.lineTo(x - size * Math.cos(angle - Math.PI / 6), y - size * Math.sin(angle - Math.PI / 6))
//     ctx.moveTo(x, y)
//     ctx.lineTo(x - size * Math.cos(angle + Math.PI / 6), y - size * Math.sin(angle + Math.PI / 6))
//     ctx.stroke()
//   }

//   // Drawing
//   const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
//     e.currentTarget.setPointerCapture(e.pointerId)
//     setIsDown(true)
//     const p = getCanvasPoint(e)
//     prevPointRef.current = p
//     const common = {
//       id: uuidv4(),
//       color,
//       strokeWidth,
//       createdAt: Date.now(),
//       updatedAt: Date.now(),
//     }
//     if (tool === "pointer") {
//       const hitShape = [...shapes].reverse().find(s => hitTest(p, s))
//       if (hitShape) {
//         const handles = ['top-left', 'top', 'top-right', 'right', 'bottom-right', 'bottom', 'bottom-left', 'left']
//         let hitHandle = null
//         for (const h of handles) {
//           if (hitResizeHandle(p, hitShape, h)) {
//             hitHandle = h
//             break
//           }
//         }
//         if (hitHandle) {
//           setIsResizing(true)
//           setResizeHandle(hitHandle)
//           setSelectedIds([hitShape.id])
//           setSelectedShapes([hitShape])
//           setLiveShape({...hitShape})
//           return
//         }
//         if (hitShape.type === "sticky" && e.detail === 2) {
//           setEditingStickyId(hitShape.id)
//           return
//         } 
//         if (hitShape.type === "text" && e.detail === 2) {
//   setEditingTextId(hitShape.id)
//   const ts = hitShape as TextShape
//   setTimeout(() => {
//     const input = document.createElement("textarea")
//     input.style.position = "absolute"
//     input.style.left = `${ts.x * zoom + offset.x}px`
//     input.style.top = `${ts.y * zoom + offset.y}px`
//     input.style.fontSize = `${ts.fontSize * zoom}px`
//     input.style.fontFamily = ts.fontFamily
//     input.style.fontWeight = ts.bold ? "bold" : ts.fontWeight || "normal"
//     input.style.fontStyle = ts.italic ? "italic" : "normal"
//     input.style.textDecoration = ts.underline ? "underline" : "none"
//     input.style.textAlign = ts.alignment
//     input.style.color = ts.color
//     input.style.lineHeight = ts.lineHeight?.toString() || "1.5"
//     input.style.transform = `rotate(${ts.rotation || 0}deg)`
//     input.style.transformOrigin = "top left"
//     input.style.border = "2px solid #007bff"
//     input.style.background = "white"
//     input.style.pointerEvents = "auto"
//     input.style.resize = "both"
//     input.style.minWidth = "100px"
//     input.style.minHeight = "30px"
//     input.style.padding = "4px"
//     input.style.zIndex = "10000"
//     input.value = ts.text
//     input.autofocus = true
//     overlayRef.current?.appendChild(input)
//     input.focus()
//     input.addEventListener("blur", () => {
//       const text = input.value.trim()
//       if (text) {
//         const updatedShape = { ...ts, text, updatedAt: Date.now() }
//         updateShapes([updatedShape])
//       } else {
//         const nextShapes = shapes.filter(s => s.id !== ts.id)
//         setShapes(nextShapes)
//         pushHistory(nextShapes)
//       }
//       overlayRef.current?.removeChild(input)
//       setEditingTextId(null)
//     })
//   }, 100)
//   return
// }
//         if (e.ctrlKey || e.metaKey) {
//           if (selectedIds.includes(hitShape.id)) {
//             setSelectedIds(selectedIds.filter(id => id !== hitShape.id))
//             setSelectedShapes(selectedShapes.filter(s => s.id !== hitShape.id))
//           } else {
//             setSelectedIds([...selectedIds, hitShape.id])
//             setSelectedShapes([...selectedShapes, hitShape])
//           }
//         } else {
//           setSelectedIds([hitShape.id])
//           setSelectedShapes([hitShape])
//           setLiveShape({...hitShape})
//         }
//         return
//       } else {
//         if (!e.ctrlKey && !e.metaKey) {
//           setSelectedIds([])
//           setSelectedShapes([])
//           setSelectionBox({ start: p, end: p })
//         }
//         return
//       }
//     }
//     if (tool === "eraser" && eraserMode === "object") {
//       const hitShape = [...shapes].reverse().find(s => hitTest(p, s))
//       if (hitShape) {
//         const nextShapes = shapes.filter(s => s.id !== hitShape.id)
//         setShapes(nextShapes)
//         pushHistory(nextShapes)
//       }
//       setIsDown(false)
//       return
//     }
//     if (tool === "image") {
//       const input = document.createElement("input")
//       input.type = "file"
//       input.accept = "image/*"
//       input.onchange = (e) => {
//         const file = (e.target as HTMLInputElement).files?.[0]
//         if (file) {
//           const reader = new FileReader()
//           reader.onload = () => {
//             commitLive({
//               ...common,
//               type: "image",
//               x: p.x,
//               y: p.y,
//               w: 100,
//               h: 100,
//               src: reader.result as string,
//               opacity,
//               showBorder,
//               flipHorizontal,
//               flipVertical,
//             } as ImageShape)
//           }
//           reader.readAsDataURL(file)
//         }
//       }
//       input.click()
//       setIsDown(false)
//       return
//     }
//     setSelectedIds([])
//     setSelectedShapes([])
//     if (["pen", "highlighter", "eraser", "smart"].includes(tool)) {
//       setLiveShape({
//         ...common,
//         type: tool,
//         points: [p],
//         opacity: tool === "highlighter" ? opacity : undefined,
//       } as PencilShape)
//     } else if (tool === "shape") {
//       setLiveShape({
//         ...common,
//         type: "shape",
//         shapeType,
//         x: p.x,
//         y: p.y,
//         w: 0,
//         h: 0,
//         borderWidth,
//         borderColor,
//         cornerRadius: shapeType === "rectangle" ? cornerRadius : undefined,
//       } as ShapeShape)
//     } else if (tool === "line") {
//       setLiveShape({
//         ...common,
//         type: "line",
//         x1: p.x,
//         y1: p.y,
//         x2: p.x,
//         y2: p.y,
//         arrow: shapeType === "single-arrow" ? "single" : shapeType === "double-arrow" ? "double" : "none",
//       } as LineShape)
//     } else if (tool === "text") {
//       const input = document.createElement("textarea")
//       input.style.position = "absolute"
//       input.style.left = `${p.x * zoom + offset.x}px`
//       input.style.top = `${p.y * zoom + offset.y}px`
//       input.style.fontSize = `${fontSize * zoom}px`
//       input.style.fontFamily = fontFamily
//       input.style.fontWeight = bold ? "bold" : fontWeight
//       input.style.fontStyle = italic ? "italic" : "normal"
//       input.style.textDecoration = underline ? "underline" : "none"
//       input.style.textAlign = alignment
//       input.style.color = color
//       input.style.lineHeight = lineHeight.toString()
//       input.style.transform = `rotate(${textRotation}deg) scale(${1/zoom})`
//       input.style.transformOrigin = "top left"
//       input.style.border = "none"
//       input.style.background = "transparent"
//       input.style.pointerEvents = "auto"
//       input.style.resize = "none"
//       input.autofocus = true
//       overlayRef.current?.appendChild(input)
//       input.addEventListener("blur", () => {
//         const text = input.value.trim()
//         if (text) {
//           commitLive({
//             ...common,
//             type: "text",
//             x: p.x,
//             y: p.y,
//             text,
//             fontSize,
//             fontFamily,
//             bold,
//             italic,
//             underline,
//             alignment,
//             lineHeight,
//             fontWeight,
//             rotation: textRotation,
//           } as TextShape)
//         }
//         overlayRef.current?.removeChild(input)
//       })
//     } else if (tool === "sticky") {
//   const newSticky: StickyShape = {
//     ...common,
//     type: "sticky",
//     x: p.x,
//     y: p.y,
//     w: 200,
//     h: 100,
//     html: "New Note",
//     bgColor,
//     textColor,
//     resizeLock,
//   }
//   const next = [...shapes, newSticky]
//   setShapes(next)
//   pushHistory(next)
//   setEditingStickyId(newSticky.id)
//   setSelectedIds([newSticky.id])
//   setSelectedShapes([newSticky])
//   setTool("pointer") // Auto-switch to pointer tool
// }
//   }

//   const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
//     if (!isDown) return
//     const p = getCanvasPoint(e)
//     if (isResizing && resizeHandle && selectedShapes.length > 0) {
//       const dx = p.x - prevPointRef.current!.x
//       const dy = p.y - prevPointRef.current!.y
//       const updatedShapes = selectedShapes.map(shape => {
//         const updated = { ...shape, updatedAt: Date.now() } as Shape
//         switch (updated.type) {
//           case "shape":
//           case "sticky":
//           case "image":
//             switch (resizeHandle) {
//               case 'bottom-right':
//                 updated.w += dx
//                 updated.h += dy
//                 break
//               case 'bottom-left':
//                 updated.x += dx
//                 updated.w -= dx
//                 updated.h += dy
//                 break
//               case 'top-right':
//                 updated.y += dy
//                 updated.w += dx
//                 updated.h -= dy
//                 break
//               case 'top-left':
//                 updated.x += dx
//                 updated.y += dy
//                 updated.w -= dx
//                 updated.h -= dy
//                 break
//               case 'right':
//                 updated.w += dx
//                 break
//               case 'left':
//                 updated.x += dx
//                 updated.w -= dx
//                 break
//               case 'bottom':
//                 updated.h += dy
//                 break
//               case 'top':
//                 updated.y += dy
//                 updated.h -= dy
//                 break
//             }
//             updated.w = Math.max(50, updated.w)
//             updated.h = Math.max(50, updated.h)
//             if (updated.type === 'shape' && (updated as ShapeShape).shapeType === 'circle') {
//               const r = Math.min(updated.w, updated.h) / 2
//               updated.r = r
//               updated.cx = updated.x + r
//               updated.cy = updated.y + r
//               updated.w = r * 2
//               updated.h = r * 2
//             }
//             break
//         }
//         return updated
//       })
//       setLiveShape(updatedShapes[0])
//     } else if (tool === "pointer" && selectedIds.length > 0 && liveShape) {
//       const dx = p.x - prevPointRef.current!.x
//       const dy = p.y - prevPointRef.current!.y
//       const updatedShapes = selectedShapes.map(shape => {
//         const updated = { ...shape, updatedAt: Date.now() } as Shape
//         switch (updated.type) {
//           case "pen":
//           case "highlighter":
//           case "eraser":
//           case "smart":
//             updated.points = updated.points.map(pt => ({ x: pt.x + dx, y: pt.y + dy }))
//             break
//           case "shape":
//             if ((updated as ShapeShape).shapeType === "circle") {
//               updated.cx! += dx
//               updated.cy! += dy
//             } else {
//               updated.x += dx
//               updated.y += dy
//             }
//             break
//           case "line":
//             updated.x1 += dx
//             updated.y1 += dy
//             updated.x2 += dx
//             updated.y2 += dy
//             break
//           case "text":
//           case "sticky":
//           case "image":
//             updated.x += dx
//             updated.y += dy
//             break
//         }
//         return updated
//       })
//       setLiveShape(updatedShapes[0])
//     } else if (tool === "pointer" && selectionBox) {
//       setSelectionBox({ ...selectionBox, end: p })
//       const selected = shapes.filter(s => {
//         const bb = getBoundingBox(s)
//         const minX = Math.min(selectionBox.start.x, p.x)
//         const maxX = Math.max(selectionBox.start.x, p.x)
//         const minY = Math.min(selectionBox.start.y, p.y)
//         const maxY = Math.max(selectionBox.start.y, p.y)
//         return bb.x > minX && bb.x + bb.w < maxX && bb.y > minY && bb.y + bb.h < maxY
//       })
//       setSelectedIds(selected.map(s => s.id))
//       setSelectedShapes(selected)
//     } else if (liveShape) {
//       setLiveShape((prev) => {
//         if (!prev) return prev
//         const updated = { ...prev, updatedAt: Date.now() } as Shape
//         if (["pen", "highlighter", "eraser", "smart"].includes(tool)) {
//           (updated as PencilShape).points = [...(updated as PencilShape).points, p]
//         } else if (tool === "shape") {
//           const s = updated as ShapeShape
//           s.w = p.x - s.x
//           s.h = p.y - s.y
//           if (s.shapeType === "circle") {
//             s.r = Math.sqrt(s.w * s.w + s.h * s.h) / 2
//             s.cx = s.x + s.w / 2
//             s.cy = s.y + s.h / 2
//           }
//         } else if (tool === "line") {
//           const l = updated as LineShape
//           l.x2 = p.x
//           l.y2 = p.y
//         }
//         return updated
//       })
//     }
//     prevPointRef.current = p
//   }

//   const onPointerUp = () => {
//     setIsDown(false)
//     setIsResizing(false)
//     setResizeHandle(null)
//     if (selectionBox) {
//       setSelectionBox(null)
//     }
//     if (liveShape) {
//       let final = liveShape
//       if (tool === "smart") {
//         const pts = (liveShape as PencilShape).points
//         const recognized = recognizeShape(pts)
//         if (recognized) final = recognized
//       }
//       if (tool === "pointer" && selectedIds.length > 0) {
//         updateShapes(selectedShapes)
//       } else {
//         commitLive(final)
//       }
//       setLiveShape(null)
//     }
//   }

//   // Render loop
//   useEffect(() => {
//     let raf = 0
//     const draw = () => {
//       const canvas = canvasRef.current
//       if (!canvas) return
//       const ctx = canvas.getContext("2d")!
//       ctx.save()
//       ctx.clearRect(0, 0, canvas.width, canvas.height)
//       ctx.translate(offset.x, offset.y)
//       ctx.scale(zoom, zoom)

//       if (showGrid) {
//         const gridSize = 10
//         ctx.strokeStyle = "#ddd"
//         ctx.lineWidth = 0.5 / zoom
//         for (let x = 0; x < canvas.width / zoom; x += gridSize) {
//           ctx.beginPath()
//           ctx.moveTo(x, 0)
//           ctx.lineTo(x, canvas.height / zoom)
//           ctx.stroke()
//         }
//         for (let y = 0; y < canvas.height / zoom; y += gridSize) {
//           ctx.beginPath()
//           ctx.moveTo(0, y)
//           ctx.lineTo(canvas.width / zoom, y)
//           ctx.stroke()
//         }
//       }

//       const renderShape = (s: Shape, isSelected = false) => {
//         if (s.type === "sticky" || s.type === "image") return
//         ctx.save()
//         ctx.lineWidth = s.strokeWidth
//         if (s.type === "eraser") {
//           ctx.globalCompositeOperation = "destination-out"
//           ctx.strokeStyle = "rgba(0,0,0,1)"
//         } else {
//           ctx.globalCompositeOperation = "source-over"
//           ctx.strokeStyle = (s as ShapeShape).borderColor || s.color
//           ctx.fillStyle = s.color
//         }

//         switch (s.type) {
//           case "pen":
//           case "smart":
//           case "eraser": {
//             const pts = (s as PencilShape).points
//             if (pts.length < 2) break
//             ctx.beginPath()
//             ctx.moveTo(pts[0].x, pts[0].y)
//             for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y)
//             ctx.stroke()
//             break
//           }
//           case "highlighter": {
//             ctx.globalAlpha = (s as PencilShape).opacity || 0.5
//             const pts = (s as PencilShape).points
//             if (pts.length < 2) break
//             ctx.beginPath()
//             ctx.moveTo(pts[0].x, pts[0].y)
//             for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y)
//             ctx.stroke()
//             break
//           }
//           case "shape": {
//             const sh = s as ShapeShape
//             ctx.beginPath()
//             if (sh.shapeType === "rectangle") {
//               ctx.strokeRect(sh.x, sh.y, sh.w, sh.h)
//               if (sh.cornerRadius) {
//                 ctx.beginPath()
//                 ctx.moveTo(sh.x + sh.cornerRadius, sh.y)
//                 ctx.arcTo(sh.x + sh.w, sh.y, sh.x + sh.w, sh.y + sh.h, sh.cornerRadius)
//                 ctx.arcTo(sh.x + sh.w, sh.y + sh.h, sh.x, sh.y + sh.h, sh.cornerRadius)
//                 ctx.arcTo(sh.x, sh.y + sh.h, sh.x, sh.y, sh.cornerRadius)
//                 ctx.arcTo(sh.x, sh.y, sh.x + sh.w, sh.y, sh.cornerRadius)
//                 ctx.closePath()
//                 ctx.stroke()
//               }
//             } else if (sh.shapeType === "circle") {
//               ctx.arc(sh.cx!, sh.cy!, sh.r!, 0, Math.PI * 2)
//               ctx.stroke()
//             } else if (sh.shapeType === "triangle") {
//               ctx.moveTo(sh.x, sh.y)
//               ctx.lineTo(sh.x + sh.w, sh.y)
//               ctx.lineTo(sh.x + sh.w / 2, sh.y + sh.h)
//               ctx.closePath()
//               ctx.stroke()
//             } else if (sh.shapeType === "diamond") {
//               ctx.moveTo(sh.x + sh.w / 2, sh.y)
//               ctx.lineTo(sh.x + sh.w, sh.y + sh.h / 2)
//               ctx.lineTo(sh.x + sh.w / 2, sh.y + sh.h)
//               ctx.lineTo(sh.x, sh.y + sh.h / 2)
//               ctx.closePath()
//               ctx.stroke()
//             } else if (sh.shapeType === "arrow") {
//               ctx.moveTo(sh.x, sh.y + sh.h / 2)
//               ctx.lineTo(sh.x + sh.w - 10, sh.y + sh.h / 2)
//               ctx.stroke()
//               drawArrowHead(ctx, sh.x + sh.w, sh.y + sh.h / 2, 0)
//             } else if (sh.shapeType === "parallelogram") {
//               ctx.moveTo(sh.x, sh.y)
//               ctx.lineTo(sh.x + sh.w * 0.8, sh.y)
//               ctx.lineTo(sh.x + sh.w, sh.y + sh.h)
//               ctx.lineTo(sh.x + sh.w * 0.2, sh.y + sh.h)
//               ctx.closePath()
//               ctx.stroke()
//             } else if (sh.shapeType === "bubble") {
//               ctx.arc(sh.x + sh.w / 2, sh.y + sh.h / 2, Math.min(sh.w, sh.h) / 2, 0, Math.PI * 2)
//               ctx.stroke()
//               ctx.moveTo(sh.x + sh.w / 2, sh.y + sh.h)
//               ctx.lineTo(sh.x + sh.w / 2 + 10, sh.y + sh.h + 10)
//               ctx.lineTo(sh.x + sh.w / 2 - 10, sh.y + sh.h + 10)
//               ctx.stroke()
//             } else if (sh.shapeType === "star") {
//               const cx = sh.x + sh.w / 2
//               const cy = sh.y + sh.h / 2
//               const outerRadius = Math.min(sh.w, sh.h) / 2
//               const innerRadius = outerRadius / 2
//               ctx.beginPath()
//               for (let i = 0; i < 5; i++) {
//                 ctx.lineTo(cx + outerRadius * Math.cos((i * 4 * Math.PI) / 5 - Math.PI / 2), cy + outerRadius * Math.sin((i * 4 * Math.PI) / 5 - Math.PI / 2))
//                 ctx.lineTo(cx + innerRadius * Math.cos(((i + 0.5) * 4 * Math.PI) / 5 - Math.PI / 2), cy + innerRadius * Math.sin(((i + 0.5) * 4 * Math.PI) / 5 - Math.PI / 2))
//               }
//               ctx.closePath()
//               ctx.stroke()
//             } else if (sh.shapeType === "connection") {
//               ctx.moveTo(sh.x, sh.y)
//               ctx.lineTo(sh.x + sh.w / 2, sh.y)
//               ctx.lineTo(sh.x + sh.w / 2, sh.y + sh.h)
//               ctx.lineTo(sh.x + sh.w, sh.y + sh.h)
//               ctx.stroke()
//             } else if (sh.shapeType === "plain-line") {
//               ctx.moveTo(sh.x, sh.y)
//               ctx.lineTo(sh.x + sh.w, sh.y + sh.h)
//               ctx.stroke()
//             } else if (sh.shapeType === "single-arrow") {
//               ctx.moveTo(sh.x, sh.y)
//               ctx.lineTo(sh.x + sh.w, sh.y + sh.h)
//               ctx.stroke()
//               drawArrowHead(ctx, sh.x + sh.w, sh.y + sh.h, Math.atan2(sh.h, sh.w))
//             } else if (sh.shapeType === "double-arrow") {
//               ctx.moveTo(sh.x, sh.y)
//               ctx.lineTo(sh.x + sh.w, sh.y + sh.h)
//               ctx.stroke()
//               const angle = Math.atan2(sh.h, sh.w)
//               drawArrowHead(ctx, sh.x + sh.w, sh.y + sh.h, angle)
//               drawArrowHead(ctx, sh.x, sh.y, angle + Math.PI)
//             }
//             break
//           }
//           case "line": {
//             const l = s as LineShape
//             ctx.beginPath()
//             ctx.moveTo(l.x1, l.y1)
//             ctx.lineTo(l.x2, l.y2)
//             ctx.stroke()
//             if (l.arrow === "single") {
//               const angle = Math.atan2(l.y2 - l.y1, l.x2 - l.x1)
//               drawArrowHead(ctx, l.x2, l.y2, angle)
//             } else if (l.arrow === "double") {
//               const angle = Math.atan2(l.y2 - l.y1, l.x2 - l.x1)
//               drawArrowHead(ctx, l.x2, l.y2, angle)
//               drawArrowHead(ctx, l.x1, l.y1, angle + Math.PI)
//             }
//             break
//           }
//           case "text": {
//             const ts = s as TextShape
//             ctx.save()
//             ctx.translate(ts.x, ts.y)
//             if (ts.rotation) {
//               ctx.rotate((ts.rotation * Math.PI) / 180)
//             }
//             ctx.font = `${ts.fontWeight || (ts.bold ? 'bold' : 'normal')} ${ts.italic ? 'italic' : ''} ${ts.fontSize}px ${ts.fontFamily}`
//             ctx.textAlign = ts.alignment
//             ctx.fillStyle = ts.color
//             const lines = ts.text.split('\n')
//             const lineHeightPx = (ts.lineHeight || 1.5) * ts.fontSize
//             lines.forEach((line, i) => {
//               ctx.fillText(line, 0, i * lineHeightPx)
//               if (ts.underline) {
//                 const width = ctx.measureText(line).width
//                 ctx.beginPath()
//                 ctx.moveTo(0, i * lineHeightPx + 2)
//                 ctx.lineTo(width, i * lineHeightPx + 2)
//                 ctx.strokeStyle = ts.color
//                 ctx.stroke()
//               }
//             })
//             ctx.restore()
//             break
//           }
//         }
//         if (isSelected) {
//           const bb = getBoundingBox(s)
//           ctx.strokeStyle = "#007bff"
//           ctx.lineWidth = 1 / zoom
//           ctx.setLineDash([5 / zoom, 5 / zoom])
//           ctx.strokeRect(bb.x - 5 / zoom, bb.y - 5 / zoom, bb.w + 10 / zoom, bb.h + 10 / zoom)
//           ctx.setLineDash([])
//           const isResizable = ['shape', 'sticky', 'image'].includes(s.type)
//           if (isResizable) {
//             ctx.fillStyle = "#007bff"
//             const handleSize = 8 / zoom
//             const handles = ['top-left', 'top', 'top-right', 'right', 'bottom-right', 'bottom', 'bottom-left', 'left']
//             handles.forEach(handle => {
//               const pos = getResizeHandlePosition(bb, handle)
//               ctx.fillRect(pos.x - handleSize / 2, pos.y - handleSize / 2, handleSize, handleSize)
//             })
//           }
//         }
//         ctx.restore()
//       }

//       shapes.forEach(s => renderShape(s, selectedIds.includes(s.id)))
//       if (liveShape) renderShape(liveShape)
//       if (selectionBox) {
//         ctx.strokeStyle = "#007bff"
//         ctx.lineWidth = 1 / zoom
//         ctx.setLineDash([5 / zoom, 5 / zoom])
//         ctx.strokeRect(
//           Math.min(selectionBox.start.x, selectionBox.end.x),
//           Math.min(selectionBox.start.y, selectionBox.end.y),
//           Math.abs(selectionBox.end.x - selectionBox.start.x),
//           Math.abs(selectionBox.end.y - selectionBox.start.y)
//         )
//         ctx.setLineDash([])
//       }

//       ctx.restore()
//       raf = requestAnimationFrame(draw)
//     }
//     raf = requestAnimationFrame(draw)
//     return () => cancelAnimationFrame(raf)
//   }, [shapes, liveShape, selectedIds, zoom, offset, tool, selectionBox, showGrid])

//   // Wheel for zoom/pan
//   useEffect(() => {
//     const canvas = canvasRef.current
//     if (!canvas) return
//     const handleWheel = (e: WheelEvent) => {
//       e.preventDefault()
//       if (e.ctrlKey) {
//         const delta = e.deltaY * -0.001
//         setZoom(prev => Math.max(0.1, Math.min(3, prev * (1 + delta))))
//       } else {
//         setOffset(prev => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }))
//       }
//     }
//     canvas.addEventListener("wheel", handleWheel, { passive: false })
//     return () => canvas.removeEventListener("wheel", handleWheel)
//   }, [])

//   // Undo / Redo
//   const undo = () => {
//     if (hi <= 0) return
//     const idx = hi - 1
//     setHi(idx)
//     setShapes(history[idx])
//   }

//   const redo = () => {
//     if (hi >= history.length - 1) return
//     const idx = hi + 1
//     setHi(idx)
//     setShapes(history[idx])
//   }

//   // Export / Save
//   const exportPNG = async () => {
//     const canvas = canvasRef.current!
//     const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve as any))
//     if (!blob) return
//     const url = URL.createObjectURL(blob)
//     const a = document.createElement("a")
//     a.href = url
//     a.download = `whiteboard-${Date.now()}.png`
//     a.click()
//     URL.revokeObjectURL(url)
//   }

//   const saveDoc = () => {
//     const doc = { shapes }
//     onSave?.(doc)
//   }

//   // Selected Toolbar Position
//   const getSelectedToolbarPosition = () => {
//     if (selectedShapes.length === 0) return { top: 0, left: 0 }
//     const bbs = selectedShapes.map(getBoundingBox)
//     const minX = Math.min(...bbs.map(bb => bb.x))
//     const minY = Math.min(...bbs.map(bb => bb.y))
//     const top = (minY * zoom + offset.y) - 50
//     const left = minX * zoom + offset.x
//     return { top, left }
//   }

//   const { top: selectedTop, left: selectedLeft } = getSelectedToolbarPosition()

//   return (
//     <div className="h-full flex">
//       <div className="flex-grow relative">
//         <canvas
//           ref={canvasRef}
//           onPointerDown={onPointerDown}
//           onPointerMove={onPointerMove}
//           onPointerUp={onPointerUp}
//           onPointerCancel={onPointerUp}
//           className="w-full h-full touch-none bg-black"
//         />
//         <div ref={overlayRef} className="absolute top-0 left-0 w-full h-full pointer-events-none">
//           {shapes.filter(s => s.type === "sticky").map((s) => (
//             <StickyNoteComponent
//               key={s.id}
//               shape={s as StickyShape}
//               zoom={zoom}
//               offset={offset}
//               editing={editingStickyId === s.id}
//               selected={selectedIds.includes(s.id)}
//               onStartEdit={() => setEditingStickyId(s.id)}
//               onUpdate={(html, w, h, bgColor, textColor, resizeLock) => {
//                 const updated = { ...s, html, w, h, bgColor, textColor, resizeLock, updatedAt: Date.now() } as StickyShape
//                 updateShapes([updated])
//               }}
//               onDuplicate={(newShape) => {
//                 setShapes([...shapes, newShape])
//                 pushHistory([...shapes, newShape])
//                 setEditingStickyId(null)
//               }}
//               onDelete={() => {
//                 const next = shapes.filter(sh => sh.id !== s.id)
//                 setShapes(next)
//                 pushHistory(next)
//                 setEditingStickyId(null)
//               }}
//               onBringToFront={() => {
//                 const next = shapes.filter(sh => sh.id !== s.id)
//                 next.push(s)
//                 setShapes(next)
//                 pushHistory(next)
//               }}
//               onSendToBack={() => {
//                 const next = shapes.filter(sh => sh.id !== s.id)
//                 next.unshift(s)
//                 setShapes(next)
//                 pushHistory(next)
//               }}
//             />
//           ))}
//         </div>
//         <div className="absolute top-1/2 left-4 transform -translate-y-1/2 z-20 bg-white rounded-md shadow-md flex flex-col gap-1 p-1 pointer-events-auto">
//           <Button variant={tool === "pointer" ? "default" : "outline"} size="icon" onClick={() => setTool("pointer")}>
//             <Move className="h-4 w-4" />
//           </Button>
//           <Popover>
//             <PopoverTrigger asChild>
//               <Button variant={["pen", "highlighter", "smart", "eraser"].includes(tool) ? "default" : "outline"} size="icon">
//                 <Pencil className="h-4 w-4" />
//               </Button>
//             </PopoverTrigger>
//             <PopoverContent className="w-40 flex flex-col gap-2" side="right">
//               <Button variant={tool === "pen" ? "default" : "outline"} size="sm" onClick={() => setTool("pen")}>
//                 Pen
//               </Button>
//               <Button variant={tool === "highlighter" ? "default" : "outline"} size="sm" onClick={() => setTool("highlighter")}>
//                 Highlighter
//               </Button>
//               <Button variant={tool === "smart" ? "default" : "outline"} size="sm" onClick={() => setTool("smart")}>
//                 Smart Pen
//               </Button>
//               <Button variant={tool === "eraser" ? "default" : "outline"} size="sm" onClick={() => setTool("eraser")}>
//                 Eraser
//               </Button>
//             </PopoverContent>
//           </Popover>
//           <Popover>
//             <PopoverTrigger asChild>
//               <Button variant={tool === "shape" ? "default" : "outline"} size="icon">
//                 <Square className="h-4 w-4" />
//               </Button>
//             </PopoverTrigger>
//             <PopoverContent className="w-40 flex flex-col gap-2" side="right">
//               <Button variant={shapeType === "rectangle" ? "default" : "outline"} size="sm" onClick={() => { setShapeType("rectangle"); setTool("shape"); }}>
//                 Rectangle
//               </Button>
//               <Button variant={shapeType === "circle" ? "default" : "outline"} size="sm" onClick={() => { setShapeType("circle"); setTool("shape"); }}>
//                 Circle
//               </Button>
//               <Button variant={shapeType === "triangle" ? "default" : "outline"} size="sm" onClick={() => { setShapeType("triangle"); setTool("shape"); }}>
//                 Triangle
//               </Button>
//               <Button variant={shapeType === "diamond" ? "default" : "outline"} size="sm" onClick={() => { setShapeType("diamond"); setTool("shape"); }}>
//                 Diamond
//               </Button>
//               <Button variant={shapeType === "plain-line" ? "default" : "outline"} size="sm" onClick={() => { setShapeType("plain-line"); setTool("shape"); }}>
//                 Plain Line
//               </Button>
//               <Button variant={shapeType === "single-arrow" ? "default" : "outline"} size="sm" onClick={() => { setShapeType("single-arrow"); setTool("shape"); }}>
//                 Single Arrow
//               </Button>
//               <Button variant={shapeType === "double-arrow" ? "default" : "outline"} size="sm" onClick={() => { setShapeType("double-arrow"); setTool("shape"); }}>
//                 Double Arrow
//               </Button>
//               <Button variant={shapeType === "arrow" ? "default" : "outline"} size="sm" onClick={() => { setShapeType("arrow"); setTool("shape"); }}>
//                 Arrow
//               </Button>
//               <Button variant={shapeType === "parallelogram" ? "default" : "outline"} size="sm" onClick={() => { setShapeType("parallelogram"); setTool("shape"); }}>
//                 Parallelogram
//               </Button>
//               <Popover>
//                 <PopoverTrigger asChild>
//                   <Button variant="outline" size="sm">
//                     More Shapes
//                   </Button>
//                 </PopoverTrigger>
//                 <PopoverContent className="w-80 grid grid-cols-4 gap-2" side="right">
//                   <Button variant={shapeType === "bubble" ? "default" : "outline"} size="icon" onClick={() => { setShapeType("bubble"); setTool("shape"); }}>
//                     <MessageCircle className="h-4 w-4" />
//                   </Button>
//                   <Button variant={shapeType === "star" ? "default" : "outline"} size="icon" onClick={() => { setShapeType("star"); setTool("shape"); }}>
//                     <Star className="h-4 w-4" />
//                   </Button>
//                   <Button variant={shapeType === "connection" ? "default" : "outline"} size="icon" onClick={() => { setShapeType("connection"); setTool("shape"); }}>
//                     <Minus className="h-4 w-4" />
//                   </Button>
//                 </PopoverContent>
//               </Popover>
//             </PopoverContent>
//           </Popover>
//           <Button variant={tool === "text" ? "default" : "outline"} size="icon" onClick={() => setTool("text")}>
//             <Type className="h-4 w-4" />
//           </Button>
//           <Button variant={tool === "sticky" ? "default" : "outline"} size="icon" onClick={() => setTool("sticky")}>
//             <StickyNote className="h-4 w-4" />
//           </Button>
//           <Popover>
//             <PopoverTrigger asChild>
//               <Button variant="outline" size="icon">
//                 <CircleIcon className="h-4 w-4" fill={color} stroke="none" />
//               </Button>
//             </PopoverTrigger>
//             <PopoverContent className="w-40 grid grid-cols-4 gap-2" side="right">
//               <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="col-span-4 h-6 p-0 border-none" />
//               <Button style={{ backgroundColor: "#ffff00" }} size="icon" onClick={() => setColor("#ffff00")}></Button>
//               <Button style={{ backgroundColor: "#ffaa00" }} size="icon" onClick={() => setColor("#ffaa00")}></Button>
//               <Button style={{ backgroundColor: "#ff0000" }} size="icon" onClick={() => setColor("#ff0000")}></Button>
//               <Button style={{ backgroundColor: "#aa00ff" }} size="icon" onClick={() => setColor("#aa00ff")}></Button>
//               <Button style={{ backgroundColor: "#00ff00" }} size="icon" onClick={() => setColor("#00ff00")}></Button>
//               <Button style={{ backgroundColor: "#00aaff" }} size="icon" onClick={() => setColor("#00aaff")}></Button>
//               <Button style={{ backgroundColor: "#0000ff" }} size="icon" onClick={() => setColor("#0000ff")}></Button>
//               <Button style={{ backgroundColor: "#000000" }} size="icon" onClick={() => setColor("#000000")}></Button>
//             </PopoverContent>
//           </Popover>
//           <Popover>
//             <PopoverTrigger asChild>
//               <Button variant="outline" size="icon">
//                 <Square className="h-4 w-4" fill={bgColor} stroke="none" />
//               </Button>
//             </PopoverTrigger>
//             <PopoverContent className="w-40 grid grid-cols-4 gap-2" side="right">
//               <Input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="col-span-4 h-6 p-0 border-none" />
//               <Button style={{ backgroundColor: "#ffff88" }} size="icon" onClick={() => setBgColor("#ffff88")}></Button>
//               <Button style={{ backgroundColor: "#ffcccb" }} size="icon" onClick={() => setBgColor("#ffcccb")}></Button>
//               <Button style={{ backgroundColor: "#add8e6" }} size="icon" onClick={() => setBgColor("#add8e6")}></Button>
//               <Button style={{ backgroundColor: "#90ee90" }} size="icon" onClick={() => setBgColor("#90ee90")}></Button>
//             </PopoverContent>
//           </Popover>
//           <Popover>
//             <PopoverTrigger asChild>
//               <Button variant="outline" size="icon" className="relative">
//                 <HighlighterIcon className="h-4 w-4" />
//                 <span className="absolute bottom-0 right-0 text-xs bg-white px-1 rounded">{strokeWidth}</span>
//               </Button>
//             </PopoverTrigger>
//             <PopoverContent className="w-40 flex flex-col gap-2" side="right">
//               <label>Stroke Width</label>
//               <Slider value={[strokeWidth]} onValueChange={(v) => setStrokeWidth(v[0])} min={1} max={50} step={1} />
//               {tool === "eraser" && (
//                 <div className="flex flex-col gap-2">
//                   <label>Eraser Mode</label>
//                   <Select value={eraserMode} onValueChange={(v) => setEraserMode(v as "stroke" | "object")}>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select mode" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="stroke">Stroke Eraser</SelectItem>
//                       <SelectItem value="object">Object Eraser</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               )}
//               {tool === "text" && (
//   <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white p-2 border rounded shadow-md flex gap-2 items-center pointer-events-auto z-20">
//     <label className="text-xs">Font Size</label>
//     <Slider value={[fontSize]} onValueChange={(v) => setFontSize(v[0])} min={8} max={72} step={1} className="w-20" />
//     <Select value={fontFamily} onValueChange={setFontFamily}>
//       <SelectTrigger className="w-24">
//         <SelectValue />
//       </SelectTrigger>
//       <SelectContent>
//         <SelectItem value="Arial">Arial</SelectItem>
//         <SelectItem value="Helvetica">Helvetica</SelectItem>
//         <SelectItem value="Times New Roman">Times</SelectItem>
//         <SelectItem value="Courier New">Courier</SelectItem>
//       </SelectContent>
//     </Select>
//     <Button variant={bold ? "default" : "outline"} size="sm" onClick={() => setBold(!bold)}>B</Button>
//     <Button variant={italic ? "default" : "outline"} size="sm" onClick={() => setItalic(!italic)}>I</Button>
//     <Button variant={underline ? "default" : "outline"} size="sm" onClick={() => setUnderline(!underline)}>U</Button>
//     <Select value={alignment} onValueChange={(v) => setAlignment(v as "left" | "center" | "right")}>
//       <SelectTrigger className="w-20">
//         <SelectValue />
//       </SelectTrigger>
//       <SelectContent>
//         <SelectItem value="left">Left</SelectItem>
//         <SelectItem value="center">Center</SelectItem>
//         <SelectItem value="right">Right</SelectItem>
//       </SelectContent>
//     </Select>
//     <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8" />
//   </div>
// )}
//             </PopoverContent>
//           </Popover>
//           <Button variant="outline" size="icon" onClick={undo} disabled={hi <= 0}>
//             <Undo className="h-4 w-4" />
//           </Button>
//           <Button variant="outline" size="icon" onClick={redo} disabled={hi >= history.length - 1}>
//             <Redo className="h-4 w-4" />
//           </Button>
//         </div>
//         {selectedShapes.length > 0 && selectedShapes.some(s => s.type === "text") && (
//   <div style={{ position: "absolute", top: selectedTop - 50, left: selectedLeft, transform: `scale(${1/zoom})`, transformOrigin: "left top" }} className="bg-white p-2 border rounded shadow-md flex gap-2 items-center pointer-events-auto z-30 flex-wrap">
//     <Select value={fontSize.toString()} onValueChange={(v) => {
//       const newSize = parseInt(v)
//       setFontSize(newSize)
//       const updatedShapes = selectedShapes.filter(s => s.type === "text").map(s => ({ ...s, fontSize: newSize, updatedAt: Date.now() }))
//       updateShapes(updatedShapes)
//     }}>
//       <SelectTrigger className="w-[80px] h-8 text-xs">
//         <SelectValue />
//       </SelectTrigger>
//       <SelectContent>
//         {[8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72].map(size => (
//           <SelectItem key={size} value={size.toString()}>{size}px</SelectItem>
//         ))}
//       </SelectContent>
//     </Select>
//     <Select value={fontFamily} onValueChange={(v) => {
//       setFontFamily(v)
//       const updatedShapes = selectedShapes.filter(s => s.type === "text").map(s => ({ ...s, fontFamily: v, updatedAt: Date.now() }))
//       updateShapes(updatedShapes)
//     }}>
//       <SelectTrigger className="w-[100px] h-8 text-xs">
//         <SelectValue />
//       </SelectTrigger>
//       <SelectContent>
//         <SelectItem value="Arial">Arial</SelectItem>
//         <SelectItem value="Helvetica">Helvetica</SelectItem>
//         <SelectItem value="Times New Roman">Times</SelectItem>
//         <SelectItem value="Courier New">Courier</SelectItem>
//         <SelectItem value="Georgia">Georgia</SelectItem>
//         <SelectItem value="Verdana">Verdana</SelectItem>
//       </SelectContent>
//     </Select>
//     <Button variant={bold ? "default" : "outline"} size="sm" onClick={() => {
//       const newBold = !bold
//       setBold(newBold)
//       const updatedShapes = selectedShapes.filter(s => s.type === "text").map(s => ({ ...s, bold: newBold, updatedAt: Date.now() }))
//       updateShapes(updatedShapes)
//     }}>B</Button>
//     <Button variant={italic ? "default" : "outline"} size="sm" onClick={() => {
//       const newItalic = !italic
//       setItalic(newItalic)
//       const updatedShapes = selectedShapes.filter(s => s.type === "text").map(s => ({ ...s, italic: newItalic, updatedAt: Date.now() }))
//       updateShapes(updatedShapes)
//     }}>I</Button>
//     <Button variant={underline ? "default" : "outline"} size="sm" onClick={() => {
//       const newUnderline = !underline
//       setUnderline(newUnderline)
//       const updatedShapes = selectedShapes.filter(s => s.type === "text").map(s => ({ ...s, underline: newUnderline, updatedAt: Date.now() }))
//       updateShapes(updatedShapes)
//     }}>U</Button>
//     <Select value={alignment} onValueChange={(v) => {
//       const newAlignment = v as "left" | "center" | "right"
//       setAlignment(newAlignment)
//       const updatedShapes = selectedShapes.filter(s => s.type === "text").map(s => ({ ...s, alignment: newAlignment, updatedAt: Date.now() }))
//       updateShapes(updatedShapes)
//     }}>
//       <SelectTrigger className="w-[80px] h-8 text-xs">
//         <SelectValue />
//       </SelectTrigger>
//       <SelectContent>
//         <SelectItem value="left">Left</SelectItem>
//         <SelectItem value="center">Center</SelectItem>
//         <SelectItem value="right">Right</SelectItem>
//       </SelectContent>
//     </Select>
//     <Input type="color" value={color} onChange={(e) => {
//       const newColor = e.target.value
//       setColor(newColor)
//       const updatedShapes = selectedShapes.filter(s => s.type === "text").map(s => ({ ...s, color: newColor, updatedAt: Date.now() }))
//       updateShapes(updatedShapes)
//     }} className="w-10 h-8" />
//   </div>
// )}
//         <div className="absolute bottom-4 right-4 flex gap-2">
//           <Button onClick={() => setZoom(prev => prev - 0.1)}>-</Button>
//           <span>{Math.round(zoom * 100)}%</span>
//           <Button onClick={() => setZoom(prev => prev + 0.1)}>+</Button>
//           <Button onClick={exportPNG}>
//             <Download className="h-4 w-4 mr-2" /> Export
//           </Button>
//           <Button onClick={saveDoc}>
//             <Save className="h-4 w-4 mr-2" /> Save
//           </Button>
//         </div>
//       </div>
//     </div>
//   )
// }

"use client"; // Ensures client-side rendering (App Router only)

import dynamic from "next/dynamic";
import "@excalidraw/excalidraw/index.css";

// Dynamically import Excalidraw to disable SSR
const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  { ssr: false }
);

export default function Whiteboard() {
  function convertToExcalidrawElements(
    shapes: { type: string; width: number; height: number }[]
  ) {
    // Map simple shape objects to Excalidraw element format
    return shapes.map((shape, idx) => {
      if (shape.type === "rectangle") {
        return {
          id: `rect-${idx}`,
          type: "rectangle",
          x: 100,
          y: 100 + idx * 120,
          width: shape.width,
          height: shape.height,
          angle: 0,
          strokeColor: "#000000",
          backgroundColor: "#ffffff",
          fillStyle: "solid",
          strokeWidth: 1,
          strokeStyle: "solid",
          roughness: 1,
          opacity: 100,
          groupIds: [],
          roundness: null,
          seed: Math.floor(Math.random() * 100000),
          version: 1,
          versionNonce: Math.floor(Math.random() * 100000),
          isDeleted: false,
          boundElements: [],
          updated: Date.now(),
        };
      }
      // Add more shape types as needed
      return null;
    }).filter(Boolean);
  }
  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <Excalidraw />
    </div>
  );
}