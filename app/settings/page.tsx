"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Settings, Shield, Bell, Palette, Database, Zap, Crown, Sparkles } from "lucide-react"

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [autoBackup, setAutoBackup] = useState(true)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-black/10 bg-black text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Settings className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Platform Settings</h1>
              <p className="text-white/70 mt-1">Configure your Modernmen.CA barbershop platform</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="general" className="space-y-8">
          <TabsList className="grid w-full grid-cols-6 bg-black/5">
            <TabsTrigger value="general" className="data-[state=active]:bg-black data-[state=active]:text-white">
              General
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-black data-[state=active]:text-white">
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-black data-[state=active]:text-white">
              Notifications
            </TabsTrigger>
            <TabsTrigger value="integrations" className="data-[state=active]:bg-black data-[state=active]:text-white">
              Integrations
            </TabsTrigger>
            <TabsTrigger value="backup" className="data-[state=active]:bg-black data-[state=active]:text-white">
              Backup
            </TabsTrigger>
            <TabsTrigger value="premium" className="data-[state=active]:bg-black data-[state=active]:text-white">
              Premium
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card className="border-black/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Brand Configuration
                </CardTitle>
                <CardDescription>Customize your barbershop's brand identity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="business-name">Business Name</Label>
                    <Input id="business-name" defaultValue="Modernmen.CA" className="border-black/20" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input id="tagline" defaultValue="Premium Barbershop Experience" className="border-black/20" />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Brand Colors</Label>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-black rounded border-2 border-gray-300"></div>
                      <span className="text-sm font-mono">#000000</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-white rounded border-2 border-black"></div>
                      <span className="text-sm font-mono">#FFFFFF</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-500 rounded border-2 border-gray-300"></div>
                      <span className="text-sm font-mono">#6B7280</span>
                    </div>
                  </div>
                </div>

                <Separator className="bg-black/10" />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Dark Mode Interface</Label>
                    <p className="text-sm text-gray-600 mt-1">Enable dark theme for admin panels</p>
                  </div>
                  <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card className="border-black/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security & Access Control
                </CardTitle>
                <CardDescription>Manage platform security and user permissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Authentication</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Two-Factor Authentication</span>
                        <Badge variant="outline" className="border-green-200 text-green-700">
                          Enabled
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Session Timeout</span>
                        <span className="text-sm text-gray-600">24 hours</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Password Policy</span>
                        <Badge variant="outline" className="border-blue-200 text-blue-700">
                          Strong
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">API Security</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Rate Limiting</span>
                        <Badge variant="outline" className="border-green-200 text-green-700">
                          Active
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">CORS Protection</span>
                        <Badge variant="outline" className="border-green-200 text-green-700">
                          Enabled
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">SSL Certificate</span>
                        <Badge variant="outline" className="border-green-200 text-green-700">
                          Valid
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="border-black/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Configure how and when you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-600 mt-1">Receive updates via email</p>
                    </div>
                    <Switch checked={notifications} onCheckedChange={setNotifications} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-gray-600 mt-1">Browser push notifications</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>SMS Alerts</Label>
                      <p className="text-sm text-gray-600 mt-1">Critical alerts via SMS</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations */}
          <TabsContent value="integrations" className="space-y-6">
            <Card className="border-black/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Platform Integrations
                </CardTitle>
                <CardDescription>Manage connected services and APIs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border border-black/10 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Supabase</h4>
                      <Badge variant="outline" className="border-green-200 text-green-700">
                        Connected
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">Database & Authentication</p>
                  </div>

                  <div className="p-4 border border-black/10 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Payload CMS</h4>
                      <Badge variant="outline" className="border-green-200 text-green-700">
                        Connected
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">Content Management</p>
                  </div>

                  <div className="p-4 border border-black/10 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Stripe</h4>
                      <Badge variant="outline" className="border-green-200 text-green-700">
                        Connected
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">Payment Processing</p>
                  </div>

                  <div className="p-4 border border-black/10 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">OpenAI</h4>
                      <Badge variant="outline" className="border-green-200 text-green-700">
                        Connected
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">AI Features</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Backup */}
          <TabsContent value="backup" className="space-y-6">
            <Card className="border-black/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Backup & Recovery
                </CardTitle>
                <CardDescription>Manage data backups and system recovery</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Automatic Backups</Label>
                    <p className="text-sm text-gray-600 mt-1">Daily automated backups</p>
                  </div>
                  <Switch checked={autoBackup} onCheckedChange={setAutoBackup} />
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Recent Backups</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border border-black/10 rounded">
                      <span className="text-sm">Full System Backup</span>
                      <span className="text-sm text-gray-600">2 hours ago</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-black/10 rounded">
                      <span className="text-sm">Database Backup</span>
                      <span className="text-sm text-gray-600">1 day ago</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Premium Features */}
          <TabsContent value="premium" className="space-y-6">
            <Card className="border-black/10 bg-gradient-to-br from-black to-gray-800 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-400" />
                  Premium Accessories
                  <Badge className="bg-yellow-400 text-black">Pro</Badge>
                </CardTitle>
                <CardDescription className="text-white/70">
                  Enhance your platform with premium add-ons and accessories
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/10 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-yellow-400" />
                      <h4 className="font-semibold">AI Hair Simulator</h4>
                    </div>
                    <p className="text-sm text-white/70">Virtual try-on for customers</p>
                  </div>

                  <div className="p-4 bg-white/10 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-yellow-400" />
                      <h4 className="font-semibold">Advanced Analytics</h4>
                    </div>
                    <p className="text-sm text-white/70">Deep business insights</p>
                  </div>

                  <div className="p-4 bg-white/10 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-yellow-400" />
                      <h4 className="font-semibold">White-Label Solution</h4>
                    </div>
                    <p className="text-sm text-white/70">Custom branding options</p>
                  </div>

                  <div className="p-4 bg-white/10 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-yellow-400" />
                      <h4 className="font-semibold">Multi-Location</h4>
                    </div>
                    <p className="text-sm text-white/70">Franchise management</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4 mt-8">
          <Button variant="outline" className="border-black/20 bg-transparent">
            Cancel
          </Button>
          <Button className="bg-black hover:bg-gray-800 text-white">Save Changes</Button>
        </div>
      </div>
    </div>
  )
}
