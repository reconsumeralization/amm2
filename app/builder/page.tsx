"use client"

import { useState, useCallback } from "react"
import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent, closestCenter } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ComponentLibrary } from "@/components/builder/component-library"
import { BuilderCanvas } from "@/components/builder/builder-canvas"
import { PropertiesPanel } from "@/components/builder/properties-panel"
import { TemplateLibrary } from "@/components/builder/template-library"
import { AssetManager } from "@/components/builder/asset-manager"
import { SEOManager } from "@/components/builder/seo-manager"
import {
  PaintBucket,
  Save,
  Eye,
  Smartphone,
  Tablet,
  Monitor,
  Undo,
  Redo,
  Globe,
  Database,
  Users,
  BarChart3,
  Layers,
  ImageIcon,
  Palette,
} from "@/lib/icon-mapping"

export interface PageComponent {
  id: string
  type: "header" | "text" | "image" | "button" | "hero" | "services" | "testimonial" | "contact"
  content: any
  styles: any
  position: { x: number; y: number }
}

export interface Page {
  id: string
  name: string
  slug: string
  components: PageComponent[]
  settings: {
    title: string
    description: string
    published: boolean
  }
}

const initialPages: Page[] = [
  {
    id: "1",
    name: "Home Page",
    slug: "home",
    components: [
      {
        id: "hero-1",
        type: "hero",
        content: {
          title: "Welcome to BarberPro",
          subtitle: "Premium barbershop services for the modern man",
          buttonText: "Book Now",
          backgroundImage: "/hero-bg.jpg",
        },
        styles: {
          backgroundColor: "#1f2937",
          color: "#ffffff",
          padding: "4rem 2rem",
          textAlign: "center",
        },
        position: { x: 0, y: 0 },
      },
    ],
    settings: {
      title: "BarberPro - Premium Barbershop",
      description: "Professional barbershop services",
      published: true,
    },
  },
]

export default function BuilderPage() {
  const [pages, setPages] = useState<Page[]>(initialPages)
  const [currentPage, setCurrentPage] = useState<Page>(pages[0])
  const [selectedComponent, setSelectedComponent] = useState<PageComponent | null>(null)
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [showPreview, setShowPreview] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const addComponent = (componentType: PageComponent["type"]) => {
    const newComponent: PageComponent = {
      id: `${componentType}-${Date.now()}`,
      type: componentType,
      content: getDefaultContent(componentType),
      styles: getDefaultStyles(componentType),
      position: { x: 0, y: currentPage.components.length * 100 },
    }

    const updatedPage = {
      ...currentPage,
      components: [...currentPage.components, newComponent],
    }

    setCurrentPage(updatedPage)
    setPages(pages.map((p) => (p.id === currentPage.id ? updatedPage : p)))
  }

  const updateComponent = (componentId: string, updates: Partial<PageComponent>) => {
    const updatedPage = {
      ...currentPage,
      components: currentPage.components.map((comp) => (comp.id === componentId ? { ...comp, ...updates } : comp)),
    }

    setCurrentPage(updatedPage)
    setPages(pages.map((p) => (p.id === currentPage.id ? updatedPage : p)))
  }

  const deleteComponent = (componentId: string) => {
    const updatedPage = {
      ...currentPage,
      components: currentPage.components.filter((comp) => comp.id !== componentId),
    }

    setCurrentPage(updatedPage)
    setPages(pages.map((p) => (p.id === currentPage.id ? updatedPage : p)))
    setSelectedComponent(null)
  }

  const savePage = () => {
    // Save page logic here
    console.log("Saving page:", currentPage)
  }

  const publishPage = () => {
    const updatedPage = {
      ...currentPage,
      settings: { ...currentPage.settings, published: true },
    }
    setCurrentPage(updatedPage)
    setPages(pages.map((p) => (p.id === currentPage.id ? updatedPage : p)))
  }

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
    setIsDragging(true)
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setIsDragging(false)

    if (!over) return

    // Handle component reordering and addition
    if (active.id !== over.id) {
      // Reorder logic here
    }
  }, [])

  return (
    <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-screen bg-black text-white">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />

          <div className="flex items-center justify-between px-6 py-4 border-b border-red-900/20 bg-gradient-to-r from-black to-gray-900">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-600 rounded-lg">
                  <PaintBucket className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="font-bold text-xl text-white">Ultimate Builder</span>
                  <div className="text-sm text-gray-400">
                    Editing: <span className="font-medium text-red-400">{currentPage.name}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center border border-red-900/30 rounded-xl p-1 bg-black/50">
                <Button
                  size="sm"
                  variant={viewMode === "desktop" ? "default" : "ghost"}
                  onClick={() => setViewMode("desktop")}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === "tablet" ? "default" : "ghost"}
                  onClick={() => setViewMode("tablet")}
                  className="hover:bg-red-600/20"
                >
                  <Tablet className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === "mobile" ? "default" : "ghost"}
                  onClick={() => setViewMode("mobile")}
                  className="hover:bg-red-600/20"
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="border-red-900/30 hover:bg-red-600/10 bg-transparent">
                  <Undo className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" className="border-red-900/30 hover:bg-red-600/10 bg-transparent">
                  <Redo className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowPreview(!showPreview)}
                  className="border-red-900/30 hover:bg-red-600/10"
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
                <Button size="sm" onClick={savePage} className="bg-white text-black hover:bg-gray-200">
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button size="sm" onClick={publishPage} className="bg-red-600 hover:bg-red-700">
                  <Globe className="h-4 w-4 mr-2" />
                  Publish
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            <div id="tour-step-1-components" className="w-80 border-r border-red-900/20 bg-gradient-to-b from-gray-900 to-black">
              <Tabs defaultValue="components" className="h-full">
                <TabsList className="grid w-full grid-cols-4 bg-black border-b border-red-900/20">
                  <TabsTrigger value="components" className="data-[state=active]:bg-red-600">
                    <Layers className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="templates" className="data-[state=active]:bg-red-600">
                    <Palette className="h-4 w-4" /> {/* Palette is now declared */}
                  </TabsTrigger>
                  <TabsTrigger value="assets" className="data-[state=active]:bg-red-600">
                    <ImageIcon className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="data" className="data-[state=active]:bg-red-600">
                    <Database className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="components" className="h-full p-4">
                  <ComponentLibrary onAddComponent={addComponent} />
                </TabsContent>

                <TabsContent value="templates" className="h-full p-4">
                  <TemplateLibrary onApplyTemplate={(template) => {}} />
                </TabsContent>

                <TabsContent value="assets" className="h-full p-4">
                  <AssetManager onSelectAsset={(asset) => {}} />
                </TabsContent>

                <TabsContent value="data" className="h-full p-4">
                  <div className="space-y-4">
                    <div className="text-sm font-medium text-white">CRM Integration</div>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start border-red-900/30 bg-transparent"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Customer Data
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start border-red-900/30 bg-transparent"
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Analytics
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Main Canvas */}
            <div id="tour-step-2-canvas" className="flex-1 flex flex-col">
              <SortableContext items={currentPage.components.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                <BuilderCanvas
                  page={currentPage}
                  selectedComponent={selectedComponent}
                  viewMode={viewMode}
                  showPreview={showPreview}
                  onComponentSelect={setSelectedComponent}
                  onComponentUpdate={updateComponent}
                  onComponentDelete={deleteComponent}
                  isDragging={isDragging}
                />
              </SortableContext>
            </div>

            {selectedComponent && (
              <div id="tour-step-4-properties-panel" className="w-96 border-l border-red-900/20 bg-gradient-to-b from-gray-900 to-black">
                <div className="border-b border-red-900/20 p-4">
                  <Tabs defaultValue="content" className="h-full">
                    <TabsList className="grid w-full grid-cols-4 bg-black">
                      <TabsTrigger value="content" className="data-[state=active]:bg-red-600">
                        Content
                      </TabsTrigger>
                      <TabsTrigger value="style" className="data-[state=active]:bg-red-600">
                        Style
                      </TabsTrigger>
                      <TabsTrigger value="seo" className="data-[state=active]:bg-red-600">
                        SEO
                      </TavsTrigger>
                      <TabsTrigger value="data" className="data-[state=active]:bg-red-600">
                        Data
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="content">
                      <PropertiesPanel
                        component={selectedComponent}
                        onUpdate={(updates) => updateComponent(selectedComponent.id, updates)}
                        onDelete={() => deleteComponent(selectedComponent.id)}
                      />
                    </TabsContent>

                    <TabsContent value="seo">
                      <SEOManager component={selectedComponent} />
                    </TabsContent>

                    <TabsContent value="data">
                      <div className="p-4 space-y-4">
                        <div className="text-sm font-medium text-white">Dynamic Content</div>
                        <Button variant="outline" size="sm" className="w-full border-red-900/30 bg-transparent">
                          <Database className="h-4 w-4 mr-2" />
                          Bind to CRM Data
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            )}
          </div>
        </div>

        <DragOverlay>
          {activeId ? <div className="p-2 bg-red-600 text-white rounded">Dragging...</div> : null}
        </DragOverlay>
      </div>
    </DndContext>
  )
}

function getDefaultContent(type: PageComponent["type"]) {
  switch (type) {
    case "header":
      return { text: "New Header", level: "h2" }
    case "text":
      return { text: "Add your text content here..." }
    case "image":
      return { src: "/placeholder.svg?height=200&width=400", alt: "Image" }
    case "button":
      return { text: "Click Me", href: "#" }
    case "hero":
      return {
        title: "Hero Title",
        subtitle: "Hero subtitle text",
        buttonText: "Get Started",
        backgroundImage: "/placeholder.svg?height=400&width=800",
      }
    case "services":
      return {
        title: "Our Services",
        services: [
          { name: "Haircut", price: "$35", description: "Professional haircut" },
          { name: "Beard Trim", price: "$25", description: "Precision beard styling" },
          { name: "Full Service", price: "$85", description: "Complete grooming package" },
        ],
      }
    case "testimonial":
      return {
        quote: "Amazing service and great atmosphere!",
        author: "John Smith",
        rating: 5,
      }
    case "contact":
      return {
        title: "Contact Us",
        phone: "(555) 123-4567",
        email: "info@barberpro.com",
        address: "123 Main St, City, State 12345",
      }
    default:
      return {}
  }
}

function getDefaultStyles(type: PageComponent["type"]) {
  const baseStyles = {
    padding: "1rem",
    margin: "0.5rem 0",
    borderRadius: "0.5rem",
  }

  switch (type) {
    case "header":
      return { ...baseStyles, fontSize: "2rem", fontWeight: "bold", color: "#1f2937" }
    case "text":
      return { ...baseStyles, fontSize: "1rem", lineHeight: "1.6", color: "#374151" }
    case "button":
      return {
        ...baseStyles,
        backgroundColor: "#6366f1",
        color: "#ffffff",
        padding: "0.75rem 1.5rem",
        border: "none",
        cursor: "pointer",
        display: "inline-block",
        textDecoration: "none",
      }
    case "hero":
      return {
        ...baseStyles,
        backgroundColor: "#1f2937",
        color: "#ffffff",
        padding: "4rem 2rem",
        textAlign: "center",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    default:
      return baseStyles
  }
}
