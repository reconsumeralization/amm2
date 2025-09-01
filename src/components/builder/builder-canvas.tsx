"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Trash2, Edit } from "@/lib/icon-mapping"
import { cn } from "@/lib/utils"
import type { Page, PageComponent } from "@/app/builder/page"

interface BuilderCanvasProps {
  page: Page
  selectedComponent: PageComponent | null
  viewMode: "desktop" | "tablet" | "mobile"
  showPreview: boolean
  onComponentSelect: (component: PageComponent) => void
  onComponentUpdate: (componentId: string, updates: Partial<PageComponent>) => void
  onComponentDelete: (componentId: string) => void
}

export function BuilderCanvas({
  page,
  selectedComponent,
  viewMode,
  showPreview,
  onComponentSelect,
  onComponentUpdate,
  onComponentDelete,
}: BuilderCanvasProps) {
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

  const renderComponent = (component: PageComponent) => {
    const isSelected = selectedComponent?.id === component.id

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
      <div
        key={component.id}
        className={cn("relative group cursor-pointer", isSelected && "ring-2 ring-primary ring-offset-2")}
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
                onClick={(e) => {
                  e.stopPropagation()
                  onComponentSelect(component)
                }}
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={(e) => {
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
      </div>
    )
  }

  return (
    <div className="flex-1 bg-muted/30 p-6">
      <div className={cn("mx-auto bg-background rounded-lg shadow-lg min-h-full", getCanvasWidth())}>
        <ScrollArea className="h-full">
          <div className="p-6 space-y-4">
            {page.components.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="text-lg font-medium mb-2">Start building your page</div>
                <div className="text-sm">Add components from the sidebar to get started</div>
              </div>
            ) : (
              page.components.map(renderComponent)
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
