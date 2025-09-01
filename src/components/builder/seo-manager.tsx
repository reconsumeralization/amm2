"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, TrendingUp, Eye } from "lucide-react"
import type { PageComponent } from "@/app/builder/page"

interface SEOManagerProps {
  component: PageComponent
}

export function SEOManager({ component }: SEOManagerProps) {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Search className="h-4 w-4 text-red-400" />
        <span className="font-medium text-white">SEO Optimization</span>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="seo-title" className="text-white">
            Meta Title
          </Label>
          <Input id="seo-title" placeholder="Enter SEO title..." className="bg-gray-800 border-red-900/30 text-white" />
          <div className="text-xs text-gray-400 mt-1">0/60 characters</div>
        </div>

        <div>
          <Label htmlFor="seo-description" className="text-white">
            Meta Description
          </Label>
          <Textarea
            id="seo-description"
            placeholder="Enter SEO description..."
            className="bg-gray-800 border-red-900/30 text-white"
            rows={3}
          />
          <div className="text-xs text-gray-400 mt-1">0/160 characters</div>
        </div>

        <div>
          <Label htmlFor="seo-keywords" className="text-white">
            Keywords
          </Label>
          <Input
            id="seo-keywords"
            placeholder="barbershop, haircut, grooming..."
            className="bg-gray-800 border-red-900/30 text-white"
          />
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium text-white">SEO Score</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-700 rounded-full h-2">
              <div className="bg-red-600 h-2 rounded-full w-3/4"></div>
            </div>
            <Badge className="bg-red-600">75/100</Badge>
          </div>
        </div>

        <div className="space-y-2">
          <Button size="sm" variant="outline" className="w-full border-red-900/30 bg-transparent">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analyze Keywords
          </Button>
          <Button size="sm" variant="outline" className="w-full border-red-900/30 bg-transparent">
            <Eye className="h-4 w-4 mr-2" />
            Preview SERP
          </Button>
        </div>
      </div>
    </div>
  )
}
