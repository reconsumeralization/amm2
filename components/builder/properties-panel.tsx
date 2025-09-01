"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trash2 } from "lucide-react"
import type { PageComponent } from "@/app/builder/page"

interface PropertiesPanelProps {
  component: PageComponent
  onUpdate: (updates: Partial<PageComponent>) => void
  onDelete: () => void
}

export function PropertiesPanel({ component, onUpdate, onDelete }: PropertiesPanelProps) {
  const updateContent = (key: string, value: any) => {
    onUpdate({
      content: { ...component.content, [key]: value },
    })
  }

  const updateStyle = (key: string, value: any) => {
    onUpdate({
      styles: { ...component.styles, [key]: value },
    })
  }

  const renderContentEditor = () => {
    switch (component.type) {
      case "header":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="header-text">Header Text</Label>
              <Input
                id="header-text"
                value={component.content.text || ""}
                onChange={(e) => updateContent("text", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="header-level">Header Level</Label>
              <Select value={component.content.level || "h2"} onValueChange={(value) => updateContent("level", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="h1">H1</SelectItem>
                  <SelectItem value="h2">H2</SelectItem>
                  <SelectItem value="h3">H3</SelectItem>
                  <SelectItem value="h4">H4</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case "text":
        return (
          <div>
            <Label htmlFor="text-content">Text Content</Label>
            <Textarea
              id="text-content"
              value={component.content.text || ""}
              onChange={(e) => updateContent("text", e.target.value)}
              rows={4}
            />
          </div>
        )

      case "image":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="image-src">Image URL</Label>
              <Input
                id="image-src"
                value={component.content.src || ""}
                onChange={(e) => updateContent("src", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="image-alt">Alt Text</Label>
              <Input
                id="image-alt"
                value={component.content.alt || ""}
                onChange={(e) => updateContent("alt", e.target.value)}
              />
            </div>
          </div>
        )

      case "button":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="button-text">Button Text</Label>
              <Input
                id="button-text"
                value={component.content.text || ""}
                onChange={(e) => updateContent("text", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="button-href">Link URL</Label>
              <Input
                id="button-href"
                value={component.content.href || ""}
                onChange={(e) => updateContent("href", e.target.value)}
              />
            </div>
          </div>
        )

      case "hero":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="hero-title">Title</Label>
              <Input
                id="hero-title"
                value={component.content.title || ""}
                onChange={(e) => updateContent("title", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="hero-subtitle">Subtitle</Label>
              <Textarea
                id="hero-subtitle"
                value={component.content.subtitle || ""}
                onChange={(e) => updateContent("subtitle", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="hero-button">Button Text</Label>
              <Input
                id="hero-button"
                value={component.content.buttonText || ""}
                onChange={(e) => updateContent("buttonText", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="hero-bg">Background Image URL</Label>
              <Input
                id="hero-bg"
                value={component.content.backgroundImage || ""}
                onChange={(e) => updateContent("backgroundImage", e.target.value)}
              />
            </div>
          </div>
        )

      default:
        return <div className="text-sm text-muted-foreground">No content options available</div>
    }
  }

  const renderStyleEditor = () => {
    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="padding">Padding</Label>
          <Input
            id="padding"
            value={component.styles.padding || ""}
            onChange={(e) => updateStyle("padding", e.target.value)}
            placeholder="e.g., 1rem"
          />
        </div>
        <div>
          <Label htmlFor="margin">Margin</Label>
          <Input
            id="margin"
            value={component.styles.margin || ""}
            onChange={(e) => updateStyle("margin", e.target.value)}
            placeholder="e.g., 1rem 0"
          />
        </div>
        <div>
          <Label htmlFor="background-color">Background Color</Label>
          <Input
            id="background-color"
            type="color"
            value={component.styles.backgroundColor || "#ffffff"}
            onChange={(e) => updateStyle("backgroundColor", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="text-color">Text Color</Label>
          <Input
            id="text-color"
            type="color"
            value={component.styles.color || "#000000"}
            onChange={(e) => updateStyle("color", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="font-size">Font Size</Label>
          <Input
            id="font-size"
            value={component.styles.fontSize || ""}
            onChange={(e) => updateStyle("fontSize", e.target.value)}
            placeholder="e.g., 1rem"
          />
        </div>
        <div>
          <Label htmlFor="text-align">Text Align</Label>
          <Select
            value={component.styles.textAlign || "left"}
            onValueChange={(value) => updateStyle("textAlign", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Properties</h3>
            <p className="text-sm text-muted-foreground capitalize">{component.type} Component</p>
          </div>
          <Button size="sm" variant="destructive" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 p-4">
        <Tabs defaultValue="content" className="h-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="mt-4">
            {renderContentEditor()}
          </TabsContent>

          <TabsContent value="style" className="mt-4">
            {renderStyleEditor()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
