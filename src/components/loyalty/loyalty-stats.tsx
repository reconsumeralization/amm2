'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Award, Users, Gift, TrendingUp } from '@/lib/icon-mapping'

interface LoyaltyStatsProps {
  programs: any[]
  customers: any[]
  rewards: any[]
}

export function LoyaltyStats({ programs, customers, rewards }: LoyaltyStatsProps) {
  const totalPrograms = programs.length
  const activePrograms = programs.filter(p => p.status === 'active').length
  const totalCustomers = customers.length
  const activeCustomers = customers.filter(c => c.status === 'active').length
  const totalRewards = rewards.length
  const activeRewards = rewards.filter(r => r.isActive).length
  const totalPoints = customers.reduce((sum, c) => sum + (c.totalPointsEarned || 0), 0)
  const avgPointsPerCustomer = totalCustomers > 0 ? Math.round(totalPoints / totalCustomers) : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPrograms}</div>
          <p className="text-xs text-muted-foreground">
            {activePrograms} active
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Loyalty Members</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCustomers}</div>
          <p className="text-xs text-muted-foreground">
            {activeCustomers} active
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Available Rewards</CardTitle>
          <Gift className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalRewards}</div>
          <p className="text-xs text-muted-foreground">
            {activeRewards} active
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Points/Customer</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgPointsPerCustomer}</div>
          <p className="text-xs text-muted-foreground">
            {totalPoints.toLocaleString()} total points
          </p>
        </CardContent>
      </Card>
    </div>
  )
}