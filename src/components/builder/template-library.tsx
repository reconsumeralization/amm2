"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Crown, Zap } from "lucide-react"

interface Template {
  id: string
  name: string
  category: string
  preview: string
  isPremium: boolean
  components: any[]
}

interface TemplateLibraryProps {
  onApplyTemplate: (template: Template) => void
}

const templates: Template[] = [
  {
    id: "luxury-landing",
    name: "Luxury Landing",
    category: "Landing Pages",
    preview: "/templates/luxury-landing.jpg",
    isPremium: true,
    components: [],
  },
  {
    id: "barbershop-hero",
    name: "Barbershop Hero",
    category: "Heroes",
    preview: "/templates/barbershop-hero.jpg",
    isPremium: false,
    components: [],
  },
  {
    id: "crm-dashboard",
    name: "CRM Dashboard",
    category: "Dashboards",
    preview: "/templates/crm-dashboard.jpg",
    isPremium: true,
    components: [],
  },
]

export function TemplateLibrary({ onApplyTemplate }: TemplateLibraryProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h3 className="font-semibold text-white mb-2">Premium Templates</h3>
        <p className="text-sm text-gray-400">Professional designs for your barbershop</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-4">
          {templates.map((template) => (
            <Card key={template.id} className="bg-gray-800 border-red-900/20 hover:border-red-600/50 transition-colors">
              <CardContent className="p-4">
                <div className="aspect-video bg-gray-700 rounded-lg mb-3 relative overflow-hidden">
                  <img
                    src={template.preview || "/placeholder.svg"}
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                  {template.isPremium && (
                    <Badge className="absolute top-2 right-2 bg-red-600">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-white">{template.name}</h4>
                    <Badge variant="outline" className="text-xs border-red-900/30">
                      {template.category}
                    </Badge>
                  </div>

                  <Button
                    size="sm"
                    className="w-full bg-red-600 hover:bg-red-700"
                    onClick={() => onApplyTemplate(template)}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Apply Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
