"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Search, ImageIcon, Video, FileText } from "lucide-react"

interface Asset {
  id: string
  name: string
  type: "image" | "video" | "document"
  url: string
  size: string
  uploadedAt: string
}

interface AssetManagerProps {
  onSelectAsset: (asset: Asset) => void
}

const mockAssets: Asset[] = [
  {
    id: "1",
    name: "barbershop-hero.jpg",
    type: "image",
    url: "/assets/barbershop-hero.jpg",
    size: "2.4 MB",
    uploadedAt: "2024-01-15",
  },
  {
    id: "2",
    name: "customer-testimonial.mp4",
    type: "video",
    url: "/assets/testimonial.mp4",
    size: "15.2 MB",
    uploadedAt: "2024-01-14",
  },
]

export function AssetManager({ onSelectAsset }: AssetManagerProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])

  const filteredAssets = mockAssets.filter((asset) => asset.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h3 className="font-semibold text-white mb-2">Asset Manager</h3>
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-red-900/30 text-white"
            />
          </div>
          <Button size="sm" className="w-full bg-red-600 hover:bg-red-700">
            <Upload className="h-4 w-4 mr-2" />
            Upload Assets
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="flex-1">
        <TabsList className="grid w-full grid-cols-4 bg-black">
          <TabsTrigger value="all" className="data-[state=active]:bg-red-600">
            All
          </TabsTrigger>
          <TabsTrigger value="images" className="data-[state=active]:bg-red-600">
            Images
          </TabsTrigger>
          <TabsTrigger value="videos" className="data-[state=active]:bg-red-600">
            Videos
          </TabsTrigger>
          <TabsTrigger value="docs" className="data-[state=active]:bg-red-600">
            Docs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="flex-1">
          <ScrollArea className="h-full">
            <div className="grid grid-cols-2 gap-2">
              {filteredAssets.map((asset) => (
                <Card
                  key={asset.id}
                  className="bg-gray-800 border-red-900/20 hover:border-red-600/50 cursor-pointer transition-colors"
                  onClick={() => onSelectAsset(asset)}
                >
                  <CardContent className="p-3">
                    <div className="aspect-square bg-gray-700 rounded-lg mb-2 flex items-center justify-center">
                      {asset.type === "image" && <ImageIcon className="h-8 w-8 text-gray-400" />}
                      {asset.type === "video" && <Video className="h-8 w-8 text-gray-400" />}
                      {asset.type === "document" && <FileText className="h-8 w-8 text-gray-400" />}
                    </div>
                    <div className="text-xs text-white truncate">{asset.name}</div>
                    <div className="text-xs text-gray-400">{asset.size}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
