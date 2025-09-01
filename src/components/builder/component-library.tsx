"use client"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Type, ImageIcon, MousePointer, Layout, Star, Phone, Scissors, AlignLeft } from "lucide-react"
import type { PageComponent } from "@/app/builder/page"

interface ComponentLibraryProps {
  onAddComponent: (type: PageComponent["type"]) => void
}

const componentTypes = [
  {
    type: "header" as const,
    name: "Header",
    description: "Add headings and titles",
    icon: Type,
    category: "Text",
  },
  {
    type: "text" as const,
    name: "Text Block",
    description: "Add paragraphs and content",
    icon: AlignLeft,
    category: "Text",
  },
  {
    type: "image" as const,
    name: "Image",
    description: "Add images and photos",
    icon: ImageIcon,
    category: "Media",
  },
  {
    type: "button" as const,
    name: "Button",
    description: "Add clickable buttons",
    icon: MousePointer,
    category: "Interactive",
  },
  {
    type: "hero" as const,
    name: "Hero Section",
    description: "Large banner with title and CTA",
    icon: Layout,
    category: "Sections",
  },
  {
    type: "services" as const,
    name: "Services",
    description: "Display barbershop services",
    icon: Scissors,
    category: "Barbershop",
  },
  {
    type: "testimonial" as const,
    name: "Testimonial",
    description: "Customer reviews and ratings",
    icon: Star,
    category: "Social",
  },
  {
    type: "contact" as const,
    name: "Contact Info",
    description: "Contact details and info",
    icon: Phone,
    category: "Information",
  },
]

const categories = ["All", "Text", "Media", "Interactive", "Sections", "Barbershop", "Social", "Information"]

export function ComponentLibrary({ onAddComponent }: ComponentLibraryProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Components</h3>
        <p className="text-sm text-muted-foreground">Drag components to add them to your page</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-4">
          {categories.map((category) => {
            const categoryComponents =
              category === "All" ? componentTypes : componentTypes.filter((comp) => comp.category === category)

            if (categoryComponents.length === 0) return null

            return (
              <div key={category}>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">{category}</h4>
                <div className="space-y-2">
                  {categoryComponents.map((component) => (
                    <Card
                      key={component.type}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => onAddComponent(component.type)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <component.icon className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{component.name}</div>
                            <div className="text-xs text-muted-foreground">{component.description}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
