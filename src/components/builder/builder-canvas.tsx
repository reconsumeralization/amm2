"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Trash2, Edit } from "@/lib/icon-mapping"
import { cn } from "@/lib/utils"
import type { Page, PageComponent } from "@/app/builder/page"
import { useState } from "react"

interface BuilderCanvasProps {
  page: Page
  selectedComponent: PageComponent | null
  viewMode: "desktop" | "tablet" | "mobile"
  showPreview: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onComponentSelect: (component: PageComponent) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onComponentUpdate: (componentId: string, updates: Partial<PageComponent>) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onComponentDelete: (componentId: string) => void
  onComponentAdd?: (type: PageComponent["type"]) => void
}

export function BuilderCanvas({
  page,
  selectedComponent,
  viewMode,
  showPreview,
  onComponentSelect,
  onComponentUpdate,
  onComponentDelete,
  onComponentAdd,
}: BuilderCanvasProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [draggedComponent, setDraggedComponent] = useState<PageComponent | null>(null)

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleCanvasDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Only set drag leave if we're actually leaving the canvas area
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false)
      setDragOverIndex(null)
    }
  }

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    setDragOverIndex(null)

    const componentType = e.dataTransfer.getData('text/plain')
    if (componentType && onComponentAdd) {
      onComponentAdd(componentType as PageComponent["type"])
    }
  }

  const handleComponentDragStart = (e: React.DragEvent, component: PageComponent) => {
    setDraggedComponent(component)
    e.dataTransfer.setData('text/plain', component.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleComponentDragEnd = () => {
    setDraggedComponent(null)
    setDragOverIndex(null)
  }

  const handleComponentDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()

    if (draggedComponent && draggedComponent.id !== page.components[index]?.id) {
      setDragOverIndex(index)
    }
  }

  const handleComponentDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    e.stopPropagation()

    const draggedId = e.dataTransfer.getData('text/plain')
    if (!draggedId) return

    const draggedIndex = page.components.findIndex(comp => comp.id === draggedId)
    if (draggedIndex === -1 || draggedIndex === dropIndex) return

    // Reorder components
    const newComponents = [...page.components]
    const [removed] = newComponents.splice(draggedIndex, 1)
    newComponents.splice(dropIndex, 0, removed)

    // Update all components with new order
    newComponents.forEach((comp, index) => {
      onComponentUpdate(comp.id, { ...comp, order: index })
    })

    setDraggedComponent(null)
    setDragOverIndex(null)
  }
  const getCanvasWidth = () => {
    switch (viewMode) {
      case "mobile":
        return "max-w-sm"
      case "tablet":
        return "max-w-2xl"
      case "desktop":
        return "max-w-6xl"
      default:
        return "max-w-6xl"
    }
  }

  const renderComponent = (component: PageComponent, index: number) => {
    const isSelected = selectedComponent?.id === component.id
    const isDragged = draggedComponent?.id === component.id
    const showDropZone = dragOverIndex === index

    const componentElement = (() => {
      switch (component.type) {
        case "header":
          const HeaderTag = component.content.level || "h2"
          return <HeaderTag style={component.styles}>{component.content.text}</HeaderTag>

        case "text":
          return <p style={component.styles}>{component.content.text}</p>

        case "image":
          return (
            <img
              src={component.content.src || "/placeholder.svg"}
              alt={component.content.alt}
              style={component.styles}
              className="max-w-full h-auto"
            />
          )

        case "button":
          return (
            <a href={component.content.href} style={component.styles} className="inline-block">
              {component.content.text}
            </a>
          )

        case "hero":
          return (
            <div
              style={{
                ...component.styles,
                backgroundImage: `url(${component.content.backgroundImage})`,
              }}
              className="relative"
            >
              <div className="relative z-10">
                <h1 className="text-4xl font-bold mb-4">{component.content.title}</h1>
                <p className="text-xl mb-6">{component.content.subtitle}</p>
                <button className="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold">
                  {component.content.buttonText}
                </button>
              </div>
            </div>
          )

        case "services":
          return (
            <div style={component.styles}>
              <h2 className="text-2xl font-bold mb-6 text-center">{component.content.title}</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {component.content.services.map((service: any, index: number) => (
                  <div key={index} className="text-center p-4 border rounded-lg">
                    <h3 className="font-semibold text-lg">{service.name}</h3>
                    <p className="text-2xl font-bold text-primary my-2">{service.price}</p>
                    <p className="text-muted-foreground">{service.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )

        case "testimonial":
          return (
            <div style={component.styles} className="text-center">
              <div className="flex justify-center mb-4">
                {[...Array(component.content.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-xl">
                    ★
                  </span>
                ))}
              </div>
              <blockquote className="text-lg italic mb-4">"{component.content.quote}"</blockquote>
              <cite className="font-semibold">- {component.content.author}</cite>
            </div>
          )

        case "contact":
          return (
            <div style={component.styles}>
              <h2 className="text-2xl font-bold mb-4">{component.content.title}</h2>
              <div className="space-y-2">
                <p>
                  <strong>Phone:</strong> {component.content.phone}
                </p>
                <p>
                  <strong>Email:</strong> {component.content.email}
                </p>
                <p>
                  <strong>Address:</strong> {component.content.address}
                </p>
              </div>
            </div>
          )

        default:
          return <div>Unknown component type</div>
      }
    })()

    if (showPreview) {
      return <div key={component.id}>{componentElement}</div>
    }

    return (
      <>
        {/* Drop zone above component */}
        {showDropZone && dragOverIndex === index && (
          <div className="h-2 bg-primary/20 border-2 border-dashed border-primary rounded my-2 flex items-center justify-center">
            <div className="text-xs text-primary font-medium">Drop here</div>
          </div>
        )}

        <div
          key={component.id}
          draggable={!showPreview}
          onDragStart={(e) => handleComponentDragStart(e, component)}
          onDragEnd={handleComponentDragEnd}
          onDragOver={(e) => handleComponentDragOver(e, index)}
          onDrop={(e) => handleComponentDrop(e, index)}
          className={cn(
            "relative group cursor-pointer transition-all duration-200",
            isSelected && "ring-2 ring-primary ring-offset-2",
            isDragged && "opacity-50 scale-95",
            !showPreview && "hover:shadow-md"
          )}
          onClick={() => onComponentSelect(component)}
        >
          {componentElement}

          {/* Component Controls */}
          {!showPreview && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation()
                    onComponentSelect(component)
                  }}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation()
                    onComponentDelete(component.id)
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Selection Indicator */}
          {isSelected && !showPreview && (
            <div className="absolute -top-6 left-0 bg-primary text-primary-foreground px-2 py-1 text-xs rounded">
              {component.type}
            </div>
          )}

          {/* Drag Handle */}
          {!showPreview && (
            <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-background border rounded p-1 cursor-grab active:cursor-grabbing">
                <div className="w-3 h-3 flex flex-col gap-0.5">
                  <div className="w-full h-0.5 bg-muted-foreground rounded"></div>
                  <div className="w-full h-0.5 bg-muted-foreground rounded"></div>
                  <div className="w-full h-0.5 bg-muted-foreground rounded"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    )
  }

  return (
    <div className="flex-1 bg-muted/30 p-6">
      <div
        className={cn(
          "mx-auto bg-background rounded-lg shadow-lg min-h-full transition-all duration-200",
          getCanvasWidth(),
          isDragOver && "ring-2 ring-primary ring-offset-2 bg-primary/5"
        )}
        onDragOver={handleCanvasDragOver}
        onDragLeave={handleCanvasDragLeave}
        onDrop={handleCanvasDrop}
      >
        <ScrollArea className="h-full">
          <div className="p-6 space-y-4">
            {page.components.length === 0 ? (
              <div
                className={cn(
                  "text-center py-12 text-muted-foreground transition-all duration-200",
                  isDragOver && "bg-primary/10 border-2 border-dashed border-primary rounded-lg"
                )}
              >
                <div className="text-lg font-medium mb-2">
                  {isDragOver ? "Drop component here" : "Start building your page"}
                </div>
                <div className="text-sm">
                  {isDragOver ? "Release to add the component" : "Add components from the sidebar to get started"}
                </div>
              </div>
            ) : (
              page.components.map((component, index) => renderComponent(component, index))
            )}

            {/* Drop zone at the end */}
            {page.components.length > 0 && dragOverIndex === page.components.length && (
              <div className="h-2 bg-primary/20 border-2 border-dashed border-primary rounded my-2 flex items-center justify-center">
                <div className="text-xs text-primary font-medium">Drop here</div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
