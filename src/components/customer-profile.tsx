"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bell, Phone, MapPin, Calendar, DollarSign, Star, Edit, AlertCircle, Loader2 } from "@/lib/icon-mapping"
import { EditCustomerDialog } from "@/components/customer-components/edit-customer-dialog"
import { CustomerCommunication } from "@/components/customer-components/customer-communication"
import { LoyaltyRewards } from "@/components/customer-components/loyalty-rewards"
import { useToast } from "@/hooks/use-toast"

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
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onCustomerUpdate?: (updatedCustomer: Customer) => void
}

export function CustomerProfile({
  customer,
  open = true,
  onOpenChange,
  onCustomerUpdate
}: CustomerProfileProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [communicationDialogOpen, setCommunicationDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customerData, setCustomerData] = useState<Customer>(customer)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const { toast } = useToast()

  // Update local state when customer prop changes
  useEffect(() => {
    setCustomerData(customer)
    setLastUpdated(new Date())
  }, [customer])

  // Handle customer data refresh
  const refreshCustomerData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // In a real implementation, this would fetch updated customer data from API
      // For now, we'll simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Update the last updated timestamp
      setLastUpdated(new Date())

      toast({
        title: "Data refreshed",
        description: "Customer information has been updated.",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh customer data')
      toast({
        title: "Refresh failed",
        description: "Unable to update customer information.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Handle customer update from edit dialog
  const handleCustomerUpdate = useCallback((updatedCustomer: Partial<Customer>) => {
    const newCustomerData = { ...customerData, ...updatedCustomer }
    setCustomerData(newCustomerData)
    setLastUpdated(new Date())

    // Notify parent component
    onCustomerUpdate?.(newCustomerData)

    toast({
      title: "Profile updated",
      description: "Customer information has been successfully updated.",
    })
  }, [customerData, onCustomerUpdate, toast])

  // Handle booking appointment
  const handleBookAppointment = useCallback(() => {
    // In a real implementation, this would open a booking dialog or navigate to booking page
    toast({
      title: "Booking initiated",
      description: "Redirecting to appointment booking...",
    })
  }, [toast])

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
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto"
          aria-describedby="customer-profile-description"
        >
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={customerData.avatar || "/placeholder.svg"}
                    alt={`${customerData.name}'s profile picture`}
                  />
                  <AvatarFallback className="text-lg">
                    {customerData.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle className="text-2xl">{customerData.name}</DialogTitle>
                  <DialogDescription
                    id="customer-profile-description"
                    className="flex items-center gap-2 flex-wrap"
                  >
                    Customer since {new Date(customerData.joinDate).toLocaleDateString()}
                    <Badge variant={getStatusColor(customerData.status)}>
                      {customerData.status.toUpperCase()}
                    </Badge>
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  </DialogDescription>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshCustomerData}
                disabled={isLoading}
                aria-label="Refresh customer data"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Refresh"
                )}
              </Button>
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
                  {isLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-52" />
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span>{customerData.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span>{customerData.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span>{customerData.address}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Customer Stats */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <Calendar className="h-6 w-6 mx-auto text-muted-foreground mb-2" aria-hidden="true" />
                      {isLoading ? (
                        <Skeleton className="h-6 w-12 mx-auto mb-2" />
                      ) : (
                        <div className="text-xl font-bold">{customerData.totalVisits}</div>
                      )}
                      <p className="text-sm text-muted-foreground">Total Visits</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <DollarSign className="h-6 w-6 mx-auto text-muted-foreground mb-2" aria-hidden="true" />
                      {isLoading ? (
                        <Skeleton className="h-6 w-16 mx-auto mb-2" />
                      ) : (
                        <div className="text-xl font-bold">${customerData.totalSpent}</div>
                      )}
                      <p className="text-sm text-muted-foreground">Total Spent</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <Star className="h-6 w-6 mx-auto text-muted-foreground mb-2" aria-hidden="true" />
                      {isLoading ? (
                        <Skeleton className="h-6 w-16 mx-auto mb-2" />
                      ) : (
                        <div className="text-xl font-bold">${customerData.averageSpent}</div>
                      )}
                      <p className="text-sm text-muted-foreground">Avg per Visit</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <Star className="h-6 w-6 mx-auto text-yellow-500 mb-2" aria-hidden="true" />
                      {isLoading ? (
                        <Skeleton className="h-6 w-12 mx-auto mb-2" />
                      ) : (
                        <div className="text-xl font-bold">{customerData.loyaltyPoints}</div>
                      )}
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
                  {isLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Preferred Barber:</span>
                        <p className="mt-1">{customerData.preferredBarber || "Not specified"}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Preferred Services:</span>
                        <p className="mt-1">
                          {customerData.preferredServices.length > 0
                            ? customerData.preferredServices.join(", ")
                            : "No preferences specified"}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Notes:</span>
                        <p className="mt-1">{customerData.notes || "No notes available"}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              {/* Appointment History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Appointment History</CardTitle>
                  <CardDescription>Complete appointment history for {customerData.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      ))}
                    </div>
                  ) : customerData.appointmentHistory.length > 0 ? (
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
                        {customerData.appointmentHistory.map((appointment, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {new Date(appointment.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </TableCell>
                            <TableCell>{appointment.service}</TableCell>
                            <TableCell>{appointment.barber}</TableCell>
                            <TableCell>${appointment.price.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No appointment history available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="loyalty" className="space-y-6">
              <LoyaltyRewards
                customerId={customerData.id.toString()}
                loyaltyPoints={customerData.loyaltyPoints}
                totalSpent={customerData.totalSpent}
                totalVisits={customerData.totalVisits}
              />
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              className="flex-1 bg-black hover:bg-gray-800 text-white"
              onClick={handleBookAppointment}
              disabled={isLoading}
            >
              <Calendar className="mr-2 h-4 w-4" aria-hidden="true" />
              Book Appointment
            </Button>
            <Button
              variant="outline"
              onClick={() => setCommunicationDialogOpen(true)}
              disabled={isLoading}
            >
              <div className="mr-2 h-4 w-4 bg-muted rounded-full" aria-hidden="true" />
              Message
            </Button>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(true)}
              disabled={isLoading}
            >
              <Edit className="mr-2 h-4 w-4" aria-hidden="true" />
              Edit Profile
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <EditCustomerDialog
        customer={{
          id: customerData.id.toString(),
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          address: customerData.address,
          notes: customerData.notes,
          preferredBarber: customerData.preferredBarber,
        }}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onUpdate={handleCustomerUpdate}
      />

      {/* Communication Dialog */}
      <CustomerCommunication
        customer={{
          id: customerData.id.toString(),
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
        }}
        open={communicationDialogOpen}
        onOpenChange={setCommunicationDialogOpen}
      />
    </>
  )
}
