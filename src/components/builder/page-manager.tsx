"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Globe, Edit, Trash2 } from "lucide-react"
import type { Page } from "@/app/builder/page"

interface PageManagerProps {
  pages: Page[]
  currentPage: Page
  onPageSelect: (page: Page) => void
  onPagesUpdate: (pages: Page[]) => void
}

export function PageManager({ pages, currentPage, onPageSelect, onPagesUpdate }: PageManagerProps) {
  const [showNewPageDialog, setShowNewPageDialog] = useState(false)
  const [newPageName, setNewPageName] = useState("")
  const [newPageSlug, setNewPageSlug] = useState("")

  const createNewPage = () => {
    const newPage: Page = {
      id: Date.now().toString(),
      name: newPageName,
      slug: newPageSlug,
      components: [],
      settings: {
        title: newPageName,
        description: "",
        published: false,
      },
    }

    const updatedPages = [...pages, newPage]
    onPagesUpdate(updatedPages)
    onPageSelect(newPage)
    setShowNewPageDialog(false)
    setNewPageName("")
    setNewPageSlug("")
  }

  const deletePage = (pageId: string) => {
    const updatedPages = pages.filter((p) => p.id !== pageId)
    onPagesUpdate(updatedPages)

    if (currentPage.id === pageId && updatedPages.length > 0) {
      onPageSelect(updatedPages[0])
    }
  }

  const duplicatePage = (page: Page) => {
    const duplicatedPage: Page = {
      ...page,
      id: Date.now().toString(),
      name: `${page.name} (Copy)`,
      slug: `${page.slug}-copy`,
      settings: {
        ...page.settings,
        published: false,
      },
    }

    const updatedPages = [...pages, duplicatedPage]
    onPagesUpdate(updatedPages)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Pages</h3>
          <Dialog open={showNewPageDialog} onOpenChange={setShowNewPageDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Page</DialogTitle>
                <DialogDescription>Create a new page for your website</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="page-name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="page-name"
                    value={newPageName}
                    onChange={(e) => setNewPageName(e.target.value)}
                    className="col-span-3"
                    placeholder="About Us"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="page-slug" className="text-right">
                    URL Slug
                  </Label>
                  <Input
                    id="page-slug"
                    value={newPageSlug}
                    onChange={(e) => setNewPageSlug(e.target.value)}
                    className="col-span-3"
                    placeholder="about-us"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={createNewPage} disabled={!newPageName || !newPageSlug}>
                  Create Page
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-sm text-muted-foreground">Manage your website pages</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-2">
          {pages.map((page) => (
            <Card
              key={page.id}
              className={`cursor-pointer transition-colors ${
                currentPage.id === page.id ? "ring-2 ring-primary" : "hover:bg-accent"
              }`}
              onClick={() => onPageSelect(page)}
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{page.name}</div>
                    <div className="text-xs text-muted-foreground">/{page.slug}</div>
                    <div className="text-xs text-muted-foreground mt-1">{page.components.length} components</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={page.settings.published ? "default" : "secondary"} className="text-xs">
                      {page.settings.published ? (
                        <>
                          <Globe className="h-3 w-3 mr-1" />
                          Live
                        </>
                      ) : (
                        "Draft"
                      )}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          duplicatePage(page)
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      {pages.length > 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            deletePage(page.id)
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
