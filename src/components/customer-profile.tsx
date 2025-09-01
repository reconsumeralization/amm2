"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, Phone, MapPin, Calendar, DollarSign, Gift, Star, MessageCircle, Edit } from "lucide-react"
import { EditCustomerDialog } from "@/components/customer/edit-customer-dialog"
import { CustomerCommunication } from "@/components/customer/customer-communication"
import { LoyaltyRewards } from "@/components/customer/loyalty-rewards"

interface Customer {
  id: number
  name: string
  email: string
  phone: string
  address: string
  joinDate: string
  lastVisit: string
  totalVisits: number
  totalSpent: number
  averageSpent: number
  preferredBarber: string
  preferredServices: string[]
  loyaltyPoints: number
  status: string
  notes: string
  avatar: string
  appointmentHistory: Array<{
    date: string
    service: string
    barber: string
    price: number
  }>
}

interface CustomerProfileProps {
  customer: Customer
  onClose: () => void
}

export function CustomerProfile({ customer, onClose }: CustomerProfileProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [communicationDialogOpen, setCommunicationDialogOpen] = useState(false)

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

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={customer.avatar || "/placeholder.svg"} alt={customer.name} />
                <AvatarFallback className="text-lg">
                  {customer.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-2xl">{customer.name}</DialogTitle>
                <DialogDescription className="flex items-center gap-2">
                  Customer since {new Date(customer.joinDate).toLocaleDateString()}
                  <Badge variant={getStatusColor(customer.status)}>{customer.status.toUpperCase()}</Badge>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="loyalty">Loyalty & Rewards</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{customer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{customer.address}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Stats */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <Calendar className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                      <div className="text-xl font-bold">{customer.totalVisits}</div>
                      <p className="text-sm text-muted-foreground">Total Visits</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <DollarSign className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                      <div className="text-xl font-bold">${customer.totalSpent}</div>
                      <p className="text-sm text-muted-foreground">Total Spent</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <Star className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                      <div className="text-xl font-bold">${customer.averageSpent}</div>
                      <p className="text-sm text-muted-foreground">Avg per Visit</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <Gift className="h-6 w-6 mx-auto text-yellow-500 mb-2" />
                      <div className="text-xl font-bold">{customer.loyaltyPoints}</div>
                      <p className="text-sm text-muted-foreground">Loyalty Points</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Preferences & Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Preferred Barber:</span>
                      <p>{customer.preferredBarber}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Preferred Services:</span>
                      <p>{customer.preferredServices.join(", ")}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Notes:</span>
                      <p>{customer.notes}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              {/* Appointment History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Appointment History</CardTitle>
                  <CardDescription>Complete appointment history for {customer.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Barber</TableHead>
                        <TableHead>Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customer.appointmentHistory.map((appointment, index) => (
                        <TableRow key={index}>
                          <TableCell>{new Date(appointment.date).toLocaleDateString()}</TableCell>
                          <TableCell>{appointment.service}</TableCell>
                          <TableCell>{appointment.barber}</TableCell>
                          <TableCell>${appointment.price}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="loyalty" className="space-y-6">
              <LoyaltyRewards
                customerId={customer.id.toString()}
                loyaltyPoints={customer.loyaltyPoints}
                totalSpent={customer.totalSpent}
                totalVisits={customer.totalVisits}
              />
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button className="flex-1 bg-black hover:bg-gray-800 text-white">
              <Calendar className="mr-2 h-4 w-4" />
              Book Appointment
            </Button>
            <Button variant="outline" onClick={() => setCommunicationDialogOpen(true)}>
              <MessageCircle className="mr-2 h-4 w-4" />
              Message
            </Button>
            <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <EditCustomerDialog
        customer={{
          id: customer.id.toString(),
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          notes: customer.notes,
          preferredBarber: customer.preferredBarber,
        }}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onUpdate={() => {
          // Refresh customer data
          setEditDialogOpen(false)
        }}
      />

      {/* Communication Dialog */}
      <CustomerCommunication
        customer={{
          id: customer.id.toString(),
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
        }}
        open={communicationDialogOpen}
        onOpenChange={setCommunicationDialogOpen}
      />
    </>
  )
}
