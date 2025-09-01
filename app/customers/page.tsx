"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Search, Phone, Mail, DollarSign, Star, MessageCircle, Gift, TrendingUp } from "lucide-react"
import { AddCustomerDialog } from "@/components/add-customer-dialog"
import { CustomerFilters } from "@/components/customer-filters"
import { CustomerProfile } from "@/components/customer-profile"

const customers = [
  {
    id: 1,
    name: "John Smith",
    email: "john@email.com",
    phone: "(555) 123-4567",
    address: "123 Main St, City, State 12345",
    joinDate: "2023-01-15",
    lastVisit: "2024-12-10",
    totalVisits: 24,
    totalSpent: 1680,
    averageSpent: 70,
    preferredBarber: "Mike Johnson",
    preferredServices: ["Haircut & Beard Trim", "Premium Shave"],
    loyaltyPoints: 240,
    status: "vip",
    notes: "Regular customer, prefers short sides, allergic to certain products",
    avatar: "/customer-john.jpg",
    appointmentHistory: [
      { date: "2024-12-10", service: "Haircut & Beard Trim", barber: "Mike Johnson", price: 65 },
      { date: "2024-11-25", service: "Premium Shave", barber: "Mike Johnson", price: 45 },
      { date: "2024-11-10", service: "Full Service", barber: "Mike Johnson", price: 85 },
    ],
  },
  {
    id: 2,
    name: "David Wilson",
    email: "david@email.com",
    phone: "(555) 234-5678",
    address: "456 Oak Ave, City, State 12345",
    joinDate: "2023-06-20",
    lastVisit: "2024-12-08",
    totalVisits: 18,
    totalSpent: 990,
    averageSpent: 55,
    preferredBarber: "Sarah Davis",
    preferredServices: ["Modern Fade", "Beard Styling"],
    loyaltyPoints: 180,
    status: "regular",
    notes: "Prefers modern styles, usually books evening appointments",
    avatar: "/customer-david.jpg",
    appointmentHistory: [
      { date: "2024-12-08", service: "Modern Fade", barber: "Sarah Davis", price: 55 },
      { date: "2024-11-20", service: "Haircut", barber: "Sarah Davis", price: 35 },
      { date: "2024-11-05", service: "Beard Styling", barber: "Sarah Davis", price: 35 },
    ],
  },
  {
    id: 3,
    name: "Robert Brown",
    email: "robert@email.com",
    phone: "(555) 345-6789",
    address: "789 Pine St, City, State 12345",
    joinDate: "2024-03-10",
    lastVisit: "2024-12-15",
    totalVisits: 8,
    totalSpent: 520,
    averageSpent: 65,
    preferredBarber: "Alex Rodriguez",
    preferredServices: ["Full Service"],
    loyaltyPoints: 80,
    status: "new",
    notes: "New customer, interested in premium services",
    avatar: "/customer-robert.jpg",
    appointmentHistory: [
      { date: "2024-12-15", service: "Full Service", barber: "Alex Rodriguez", price: 85 },
      { date: "2024-11-30", service: "Haircut & Beard Trim", barber: "Alex Rodriguez", price: 65 },
      { date: "2024-11-15", service: "Premium Shave", barber: "Alex Rodriguez", price: 45 },
    ],
  },
  {
    id: 4,
    name: "Michael Davis",
    email: "michael@email.com",
    phone: "(555) 456-7890",
    address: "321 Elm St, City, State 12345",
    joinDate: "2022-08-05",
    lastVisit: "2024-12-12",
    totalVisits: 36,
    totalSpent: 2160,
    averageSpent: 60,
    preferredBarber: "Mike Johnson",
    preferredServices: ["Haircut", "Beard Styling"],
    loyaltyPoints: 360,
    status: "vip",
    notes: "Long-time customer, very loyal, refers friends frequently",
    avatar: "/customer-michael.jpg",
    appointmentHistory: [
      { date: "2024-12-12", service: "Haircut", barber: "Mike Johnson", price: 35 },
      { date: "2024-11-28", service: "Beard Styling", barber: "Mike Johnson", price: 35 },
      { date: "2024-11-14", service: "Haircut & Beard Trim", barber: "Mike Johnson", price: 65 },
    ],
  },
]

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedCustomer, setSelectedCustomer] = useState<(typeof customers)[0] | null>(null)

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)

    const matchesStatus = statusFilter === "all" || customer.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "vip":
        return "default"
      case "regular":
        return "secondary"
      case "new":
        return "outline"
      default:
        return "secondary"
    }
  }

  const totalCustomers = customers.length
  const vipCustomers = customers.filter((c) => c.status === "vip").length
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0)
  const averageSpent = totalRevenue / totalCustomers

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Customer Management</h1>
                <p className="text-muted-foreground">Manage customer relationships and track loyalty</p>
              </div>
              <AddCustomerDialog />
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCustomers}</div>
                  <p className="text-xs text-green-600">{vipCustomers} VIP customers</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-green-600">From all customers</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Avg Customer Value</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${Math.round(averageSpent)}</div>
                  <p className="text-xs text-green-600">Per customer</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Loyalty Points</CardTitle>
                  <Gift className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{customers.reduce((sum, c) => sum + c.loyaltyPoints, 0)}</div>
                  <p className="text-xs text-green-600">Total points issued</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="directory" className="space-y-4">
              <TabsList>
                <TabsTrigger value="directory">Customer Directory</TabsTrigger>
                <TabsTrigger value="vip">VIP Customers</TabsTrigger>
                <TabsTrigger value="loyalty">Loyalty Program</TabsTrigger>
                <TabsTrigger value="analytics">Customer Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="directory" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Customer Directory</CardTitle>
                        <CardDescription>Manage all customer information and relationships</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <CustomerFilters onStatusChange={setStatusFilter} />
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            placeholder="Search customers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-64"
                          />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Customer</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Last Visit</TableHead>
                          <TableHead>Total Visits</TableHead>
                          <TableHead>Total Spent</TableHead>
                          <TableHead>Loyalty Points</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCustomers.map((customer) => (
                          <TableRow key={customer.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={customer.avatar || "/placeholder.svg"} alt={customer.name} />
                                  <AvatarFallback>
                                    {customer.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{customer.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    Joined {new Date(customer.joinDate).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-sm">
                                  <Mail className="h-3 w-3" />
                                  {customer.email}
                                </div>
                                <div className="flex items-center gap-1 text-sm">
                                  <Phone className="h-3 w-3" />
                                  {customer.phone}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{new Date(customer.lastVisit).toLocaleDateString()}</TableCell>
                            <TableCell>{customer.totalVisits}</TableCell>
                            <TableCell>${customer.totalSpent}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Gift className="h-3 w-3 text-yellow-500" />
                                {customer.loyaltyPoints}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusColor(customer.status)}>{customer.status.toUpperCase()}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => setSelectedCustomer(customer)}>
                                  View
                                </Button>
                                <Button size="sm" variant="outline">
                                  <MessageCircle className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="vip" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {customers
                    .filter((c) => c.status === "vip")
                    .map((customer) => (
                      <Card key={customer.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={customer.avatar || "/placeholder.svg"} alt={customer.name} />
                                <AvatarFallback>
                                  {customer.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold">{customer.name}</h3>
                                <p className="text-sm text-muted-foreground">VIP Customer</p>
                              </div>
                            </div>
                            <Badge variant="default">VIP</Badge>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Total Visits:</span>
                              <span className="font-medium">{customer.totalVisits}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Total Spent:</span>
                              <span className="font-medium">${customer.totalSpent}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Loyalty Points:</span>
                              <span className="font-medium flex items-center gap-1">
                                <Gift className="h-3 w-3 text-yellow-500" />
                                {customer.loyaltyPoints}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Preferred Barber:</span>
                              <span className="font-medium">{customer.preferredBarber}</span>
                            </div>
                          </div>

                          <div className="mt-4 flex gap-2">
                            <Button size="sm" className="flex-1">
                              Book Appointment
                            </Button>
                            <Button size="sm" variant="outline">
                              <MessageCircle className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="loyalty" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Loyalty Program Overview</CardTitle>
                    <CardDescription>Track customer loyalty points and rewards</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <Gift className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
                            <div className="text-2xl font-bold">
                              {customers.reduce((sum, c) => sum + c.loyaltyPoints, 0)}
                            </div>
                            <p className="text-sm text-muted-foreground">Total Points Issued</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <Star className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
                            <div className="text-2xl font-bold">{vipCustomers}</div>
                            <p className="text-sm text-muted-foreground">VIP Members</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <TrendingUp className="h-8 w-8 mx-auto text-green-500 mb-2" />
                            <div className="text-2xl font-bold">
                              {Math.round(customers.reduce((sum, c) => sum + c.loyaltyPoints, 0) / customers.length)}
                            </div>
                            <p className="text-sm text-muted-foreground">Avg Points per Customer</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Customer Insights</CardTitle>
                      <CardDescription>Key metrics and trends</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Average Customer Lifetime Value:</span>
                          <span className="font-medium">${Math.round(averageSpent)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Average Visits per Customer:</span>
                          <span className="font-medium">
                            {Math.round(customers.reduce((sum, c) => sum + c.totalVisits, 0) / customers.length)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Customer Retention Rate:</span>
                          <span className="font-medium text-green-600">94%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">New Customers This Month:</span>
                          <span className="font-medium">12</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Top Customers</CardTitle>
                      <CardDescription>Highest spending customers</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {customers
                          .sort((a, b) => b.totalSpent - a.totalSpent)
                          .slice(0, 5)
                          .map((customer, index) => (
                            <div key={customer.id} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                                  {index + 1}
                                </div>
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={customer.avatar || "/placeholder.svg"} alt={customer.name} />
                                  <AvatarFallback className="text-xs">
                                    {customer.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">{customer.name}</span>
                              </div>
                              <span className="text-sm font-medium">${customer.totalSpent}</span>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Customer Profile Modal */}
      {selectedCustomer && <CustomerProfile customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />}
    </div>
  )
}
