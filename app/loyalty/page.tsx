"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Star,
  Trophy,
  Gift,
  Users,
  TrendingUp,
  Calendar,
  DollarSign,
  Award,
  Crown,
  Medal,
  Search,
  Filter,
  Plus,
  Minus,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  joinDate: string
  totalSpent: number
  totalVisits: number
  lastVisit: string
  status: 'active' | 'inactive' | 'vip'
}

interface LoyaltyTier {
  id: string
  name: string
  minSpend: number
  multiplier: number
  benefits: string[]
  color: string
  icon: string
}

interface Reward {
  id: string
  name: string
  description: string
  pointsRequired: number
  category: 'service' | 'product' | 'experience'
  value: number
  isActive: boolean
  redemptions: number
  maxRedemptions?: number
}

interface PointsTransaction {
  id: string
  customerId: string
  customerName: string
  type: 'earned' | 'redeemed' | 'expired' | 'bonus'
  points: number
  reason: string
  transactionId?: string
  timestamp: string
  expiryDate?: string
}

export default function LoyaltyPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [pointsTransactions, setPointsTransactions] = useState<PointsTransaction[]>([])
  const [rewards, setRewards] = useState<Reward[]>([])
  const [tiers, setTiers] = useState<LoyaltyTier[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTier, setSelectedTier] = useState('all')
  const [pointsToAdd, setPointsToAdd] = useState('')
  const [pointsReason, setPointsReason] = useState('')

  // Mock data
  useEffect(() => {
    setCustomers([
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        phone: '(555) 123-4567',
        joinDate: '2024-01-15',
        totalSpent: 450,
        totalVisits: 8,
        lastVisit: '2024-12-10',
        status: 'active'
      },
      {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@email.com',
        phone: '(555) 987-6543',
        joinDate: '2024-03-20',
        totalSpent: 1250,
        totalVisits: 15,
        lastVisit: '2024-12-12',
        status: 'vip'
      },
      {
        id: '3',
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.j@email.com',
        phone: '(555) 456-7890',
        joinDate: '2024-06-10',
        totalSpent: 180,
        totalVisits: 4,
        lastVisit: '2024-11-28',
        status: 'active'
      }
    ])

    setTiers([
      {
        id: 'bronze',
        name: 'Bronze',
        minSpend: 0,
        multiplier: 1,
        benefits: ['Basic points earning', 'Birthday reward'],
        color: 'bg-amber-100 text-amber-800',
        icon: '🥉'
      },
      {
        id: 'silver',
        name: 'Silver',
        minSpend: 500,
        multiplier: 1.25,
        benefits: ['25% bonus points', 'Priority booking', 'Free beverage'],
        color: 'bg-gray-100 text-gray-800',
        icon: '🥈'
      },
      {
        id: 'gold',
        name: 'Gold',
        minSpend: 1000,
        multiplier: 1.5,
        benefits: ['50% bonus points', 'VIP priority', 'Free service upgrade', 'Exclusive offers'],
        color: 'bg-yellow-100 text-yellow-800',
        icon: '🥇'
      },
      {
        id: 'platinum',
        name: 'Platinum',
        minSpend: 2500,
        multiplier: 2,
        benefits: ['100% bonus points', 'Dedicated stylist', 'Free monthly service', 'VIP lounge access'],
        color: 'bg-purple-100 text-purple-800',
        icon: '💎'
      }
    ])

    setRewards([
      {
        id: 'r1',
        name: 'Free Haircut',
        description: 'Redeem for a complimentary haircut service',
        pointsRequired: 500,
        category: 'service',
        value: 35,
        isActive: true,
        redemptions: 12,
        maxRedemptions: 50
      },
      {
        id: 'r2',
        name: '$25 Gift Card',
        description: 'Get a $25 gift card for products or services',
        pointsRequired: 750,
        category: 'product',
        value: 25,
        isActive: true,
        redemptions: 8,
        maxRedemptions: 100
      },
      {
        id: 'r3',
        name: 'VIP Experience',
        description: 'Enjoy a premium grooming experience with complimentary beverage',
        pointsRequired: 300,
        category: 'experience',
        value: 0,
        isActive: true,
        redemptions: 15
      },
      {
        id: 'r4',
        name: 'Free Beard Trim',
        description: 'Complimentary beard trimming service',
        pointsRequired: 250,
        category: 'service',
        value: 20,
        isActive: true,
        redemptions: 20,
        maxRedemptions: 30
      }
    ])

    setPointsTransactions([
      {
        id: 't1',
        customerId: '1',
        customerName: 'John Doe',
        type: 'earned',
        points: 35,
        reason: 'Haircut service',
        transactionId: 'TXN001',
        timestamp: '2024-12-10T14:30:00Z'
      },
      {
        id: 't2',
        customerId: '1',
        customerName: 'John Doe',
        type: 'redeemed',
        points: -250,
        reason: 'Free Beard Trim',
        timestamp: '2024-12-08T10:15:00Z'
      },
      {
        id: 't3',
        customerId: '2',
        customerName: 'Jane Smith',
        type: 'earned',
        points: 75,
        reason: 'Haircut & Beard service (25% bonus)',
        transactionId: 'TXN002',
        timestamp: '2024-12-12T16:45:00Z'
      }
    ])
  }, [])

  const getCustomerTier = (customer: Customer) => {
    const sortedTiers = [...tiers].sort((a, b) => b.minSpend - a.minSpend)
    return sortedTiers.find(tier => customer.totalSpent >= tier.minSpend) || tiers[0]
  }

  const getCustomerPoints = (customer: Customer) => {
    const customerTransactions = pointsTransactions.filter(t => t.customerId === customer.id)
    return customerTransactions.reduce((sum, transaction) => sum + transaction.points, 0)
  }

  const getNextTierProgress = (customer: Customer) => {
    const currentTier = getCustomerTier(customer)
    const nextTier = tiers.find(tier => tier.minSpend > currentTier.minSpend)

    if (!nextTier) return { progress: 100, remaining: 0 }

    const spentInCurrentTier = customer.totalSpent - currentTier.minSpend
    const tierRange = nextTier.minSpend - currentTier.minSpend
    const progress = (spentInCurrentTier / tierRange) * 100

    return {
      progress: Math.min(progress, 100),
      remaining: Math.max(nextTier.minSpend - customer.totalSpent, 0)
    }
  }

  const addPoints = async () => {
    if (!selectedCustomer || !pointsToAdd || !pointsReason) return

    setLoading(true)
    try {
      const points = parseInt(pointsToAdd)
      const transaction: PointsTransaction = {
        id: `t${Date.now()}`,
        customerId: selectedCustomer.id,
        customerName: `${selectedCustomer.firstName} ${selectedCustomer.lastName}`,
        type: 'bonus',
        points: points,
        reason: pointsReason,
        timestamp: new Date().toISOString()
      }

      setPointsTransactions(prev => [transaction, ...prev])
      setPointsToAdd('')
      setPointsReason('')
    } catch (error) {
      console.error('Error adding points:', error)
    } finally {
      setLoading(false)
    }
  }

  const redeemReward = async (reward: Reward) => {
    if (!selectedCustomer) return

    const customerPoints = getCustomerPoints(selectedCustomer)
    if (customerPoints < reward.pointsRequired) return

    setLoading(true)
    try {
      const transaction: PointsTransaction = {
        id: `t${Date.now()}`,
        customerId: selectedCustomer.id,
        customerName: `${selectedCustomer.firstName} ${selectedCustomer.lastName}`,
        type: 'redeemed',
        points: -reward.pointsRequired,
        reason: `Redeemed: ${reward.name}`,
        timestamp: new Date().toISOString()
      }

      setPointsTransactions(prev => [transaction, ...prev])
      setRewards(prev => prev.map(r =>
        r.id === reward.id
          ? { ...r, redemptions: r.redemptions + 1 }
          : r
      ))
    } catch (error) {
      console.error('Error redeeming reward:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch =
      customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)

    const matchesTier = selectedTier === 'all' || getCustomerTier(customer).id === selectedTier

    return matchesSearch && matchesTier
  })

  const totalCustomers = customers.length
  const activeCustomers = customers.filter(c => c.status === 'active').length
  const vipCustomers = customers.filter(c => c.status === 'vip').length
  const totalPointsIssued = pointsTransactions
    .filter(t => t.type === 'earned' || t.type === 'bonus')
    .reduce((sum, t) => sum + Math.abs(t.points), 0)
  const totalPointsRedeemed = Math.abs(pointsTransactions
    .filter(t => t.type === 'redeemed')
    .reduce((sum, t) => sum + t.points, 0))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Loyalty Program</h1>
          <p className="text-gray-600">Manage customer rewards and points system</p>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCustomers}</div>
              <p className="text-xs text-muted-foreground">
                {activeCustomers} active, {vipCustomers} VIP
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Points Issued</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPointsIssued.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Lifetime points earned
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Points Redeemed</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPointsRedeemed.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Total redemptions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Redemption Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalPointsIssued > 0 ? Math.round((totalPointsRedeemed / totalPointsIssued) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Points utilization
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="customers" className="space-y-6">
          <TabsList>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
            <TabsTrigger value="tiers">Tiers</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-6">
            {/* Search and Filter */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedTier} onValueChange={setSelectedTier}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  {tiers.map(tier => (
                    <SelectItem key={tier.id} value={tier.id}>
                      {tier.icon} {tier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Customers Table */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Loyalty Overview</CardTitle>
                <CardDescription>View and manage customer loyalty status</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Total Spent</TableHead>
                      <TableHead>Last Visit</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => {
                      const tier = getCustomerTier(customer)
                      const points = getCustomerPoints(customer)
                      const { progress, remaining } = getNextTierProgress(customer)

                      return (
                        <TableRow key={customer.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {customer.firstName} {customer.lastName}
                              </div>
                              <div className="text-sm text-gray-600">{customer.email}</div>
                              <div className="text-sm text-gray-600">{customer.phone}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{tier.icon}</span>
                              <Badge className={tier.color}>{tier.name}</Badge>
                            </div>
                            {remaining > 0 && (
                              <div className="mt-2">
                                <div className="text-xs text-gray-600 mb-1">
                                  ${remaining} to next tier
                                </div>
                                <Progress value={progress} className="h-2" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{points.toLocaleString()}</div>
                            <div className="text-sm text-gray-600">
                              {points >= 0 ? 'Available' : 'Negative'}
                            </div>
                          </TableCell>
                          <TableCell>${customer.totalSpent.toLocaleString()}</TableCell>
                          <TableCell>
                            {new Date(customer.lastVisit).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={customer.status === 'vip' ? 'default' : 'secondary'}>
                              {customer.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedCustomer(customer)}
                            >
                              Manage
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rewards Tab */}
          <TabsContent value="rewards" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rewards.map((reward) => (
                <Card key={reward.id} className={cn(!reward.isActive && "opacity-60")}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{reward.name}</CardTitle>
                        <CardDescription>{reward.description}</CardDescription>
                      </div>
                      <Badge variant="outline">
                        {reward.pointsRequired} pts
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Category:</span>
                        <Badge variant="secondary">{reward.category}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Value:</span>
                        <span>${reward.value}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Redemptions:</span>
                        <span>{reward.redemptions}{reward.maxRedemptions ? `/${reward.maxRedemptions}` : ''}</span>
                      </div>

                      {selectedCustomer && (
                        <Button
                          className="w-full"
                          size="sm"
                          onClick={() => redeemReward(reward)}
                          disabled={
                            !reward.isActive ||
                            getCustomerPoints(selectedCustomer) < reward.pointsRequired ||
                            (reward.maxRedemptions && reward.redemptions >= reward.maxRedemptions)
                          }
                        >
                          Redeem Reward
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tiers Tab */}
          <TabsContent value="tiers" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {tiers.map((tier) => (
                <Card key={tier.id}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{tier.icon}</span>
                      <div>
                        <CardTitle>{tier.name} Tier</CardTitle>
                        <CardDescription>
                          ${tier.minSpend}+ spend • {tier.multiplier}x points
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm font-medium">Benefits:</div>
                      <ul className="space-y-1">
                        {tier.benefits.map((benefit, index) => (
                          <li key={index} className="text-sm flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                      <div className="pt-3 border-t">
                        <div className="text-sm text-gray-600">
                          {customers.filter(c => getCustomerTier(c).id === tier.id).length} customers
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Points Transactions</CardTitle>
                <CardDescription>Track all points earned, redeemed, and expired</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pointsTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{transaction.customerName}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              transaction.type === 'earned' ? 'default' :
                              transaction.type === 'redeemed' ? 'destructive' :
                              transaction.type === 'bonus' ? 'secondary' : 'outline'
                            }
                          >
                            {transaction.type}
                          </Badge>
                        </TableCell>
                        <TableCell className={cn(
                          transaction.points > 0 ? "text-green-600" : "text-red-600",
                          "font-medium"
                        )}>
                          {transaction.points > 0 ? '+' : ''}{transaction.points}
                        </TableCell>
                        <TableCell>{transaction.reason}</TableCell>
                        <TableCell>
                          {new Date(transaction.timestamp).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Customer Management Modal */}
        {selectedCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Manage Customer: {selectedCustomer.firstName} {selectedCustomer.lastName}</CardTitle>
                <CardDescription>View details and manage loyalty points</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Customer Info */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-2">Contact Information</h4>
                    <div className="space-y-1 text-sm">
                      <div>Email: {selectedCustomer.email}</div>
                      <div>Phone: {selectedCustomer.phone}</div>
                      <div>Joined: {new Date(selectedCustomer.joinDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Loyalty Status</h4>
                    <div className="space-y-1 text-sm">
                      <div>Tier: {getCustomerTier(selectedCustomer).name}</div>
                      <div>Points: {getCustomerPoints(selectedCustomer).toLocaleString()}</div>
                      <div>Total Spent: ${selectedCustomer.totalSpent}</div>
                    </div>
                  </div>
                </div>

                {/* Add Points */}
                <div className="border-t pt-6">
                  <h4 className="font-medium mb-4">Add Bonus Points</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="pointsAmount">Points Amount</Label>
                      <Input
                        id="pointsAmount"
                        type="number"
                        value={pointsToAdd}
                        onChange={(e) => setPointsToAdd(e.target.value)}
                        placeholder="Enter points"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pointsReason">Reason</Label>
                      <Input
                        id="pointsReason"
                        value={pointsReason}
                        onChange={(e) => setPointsReason(e.target.value)}
                        placeholder="Bonus reason"
                      />
                    </div>
                  </div>
                  <Button
                    className="mt-4"
                    onClick={addPoints}
                    disabled={!pointsToAdd || !pointsReason || loading}
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                    Add Points
                  </Button>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setSelectedCustomer(null)}>
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}