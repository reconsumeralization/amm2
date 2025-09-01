"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function BuilderPage() {
  const [activeTab, setActiveTab] = useState("canvas")

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <div className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Page Builder</h1>
            <p className="text-gray-400">Build and manage your pages with our visual editor</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="canvas">Canvas</TabsTrigger>
              <TabsTrigger value="components">Components</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="assets">Assets</TabsTrigger>
            </TabsList>

            <TabsContent value="canvas" className="mt-6">
              <div className="bg-gray-800 rounded-lg p-8 text-center">
                <h2 className="text-xl font-semibold mb-4">Page Canvas</h2>
                <p className="text-gray-400 mb-6">Visual page builder canvas will be implemented here</p>
                <Button>Start Building</Button>
              </div>
            </TabsContent>

            <TabsContent value="components" className="mt-6">
              <div className="bg-gray-800 rounded-lg p-8 text-center">
                <h2 className="text-xl font-semibold mb-4">Component Library</h2>
                <p className="text-gray-400">Drag and drop components will be available here</p>
              </div>
            </TabsContent>

            <TabsContent value="templates" className="mt-6">
              <div className="bg-gray-800 rounded-lg p-8 text-center">
                <h2 className="text-xl font-semibold mb-4">Template Library</h2>
                <p className="text-gray-400">Pre-built templates will be available here</p>
              </div>
            </TabsContent>

            <TabsContent value="assets" className="mt-6">
              <div className="bg-gray-800 rounded-lg p-8 text-center">
                <h2 className="text-xl font-semibold mb-4">Asset Manager</h2>
                <p className="text-gray-400">Upload and manage media assets here</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
