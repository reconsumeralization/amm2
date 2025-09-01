"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Gift, Star, Trophy, Zap } from "@/lib/icon-mapping"

interface LoyaltyRewardsProps {
  customerId: string
  loyaltyPoints: number
  totalSpent: number
  totalVisits: number
}

export function LoyaltyRewards({ customerId, loyaltyPoints, totalSpent, totalVisits }: LoyaltyRewardsProps) {
  const rewardTiers = [
    { name: "Bronze", minPoints: 0, maxPoints: 99, color: "bg-amber-600", benefits: ["5% discount on services"] },
    {
      name: "Silver",
      minPoints: 100,
      maxPoints: 299,
      color: "bg-gray-400",
      benefits: ["10% discount", "Priority booking"],
    },
    {
      name: "Gold",
      minPoints: 300,
      maxPoints: 599,
      color: "bg-yellow-500",
      benefits: ["15% discount", "Free beard trim monthly"],
    },
    {
      name: "Platinum",
      minPoints: 600,
      maxPoints: 999,
      color: "bg-purple-600",
      benefits: ["20% discount", "Free premium services"],
    },
    {
      name: "Diamond",
      minPoints: 1000,
      maxPoints: Number.POSITIVE_INFINITY,
      color: "bg-blue-600",
      benefits: ["25% discount", "VIP treatment", "Exclusive events"],
    },
  ]

  const currentTier =
    rewardTiers.find((tier) => loyaltyPoints >= tier.minPoints && loyaltyPoints <= tier.maxPoints) || rewardTiers[0]
  const nextTier = rewardTiers.find((tier) => tier.minPoints > loyaltyPoints)
  const progressToNext = nextTier
    ? ((loyaltyPoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100
    : 100

  const availableRewards = [
    { name: "Free Haircut", cost: 200, icon: "✂️", available: loyaltyPoints >= 200 },
    { name: "Premium Shave", cost: 150, icon: "🪒", available: loyaltyPoints >= 150 },
    { name: "Beard Styling", cost: 100, icon: "🧔", available: loyaltyPoints >= 100 },
    { name: "Hair Treatment", cost: 300, icon: "💆", available: loyaltyPoints >= 300 },
  ]

  return (
    <div className="space-y-6">
      {/* Current Tier Status */}
      <Card className="bg-gradient-to-r from-black to-gray-800 text-white border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Trophy className="h-5 w-5" />
            {currentTier.name} Member
          </CardTitle>
          <CardDescription className="text-gray-300">You have {loyaltyPoints} loyalty points</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Current Tier:</span>
              <Badge className={`${currentTier.color} text-white`}>{currentTier.name}</Badge>
            </div>

            {nextTier && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress to {nextTier.name}:</span>
                  <span>{nextTier.minPoints - loyaltyPoints} points needed</span>
                </div>
                <Progress value={progressToNext} className="h-2" />
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm font-medium">Your Benefits:</p>
              <ul className="text-sm text-gray-300 space-y-1">
                {currentTier.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Star className="h-3 w-3 text-yellow-400" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Rewards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Available Rewards
          </CardTitle>
          <CardDescription>Redeem your loyalty points for these rewards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {availableRewards.map((reward, index) => (
              <Card
                key={index}
                className={`${reward.available ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{reward.icon}</span>
                      <div>
                        <h4 className="font-medium">{reward.name}</h4>
                        <p className="text-sm text-muted-foreground">{reward.cost} points</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      disabled={!reward.available}
                      className={reward.available ? "bg-green-600 hover:bg-green-700" : ""}
                    >
                      {reward.available ? "Redeem" : "Locked"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Points History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Recent Points Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium">Haircut & Beard Trim</p>
                <p className="text-sm text-muted-foreground">Dec 15, 2024</p>
              </div>
              <Badge variant="outline" className="text-green-600">
                +65 points
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium">Premium Shave</p>
                <p className="text-sm text-muted-foreground">Nov 28, 2024</p>
              </div>
              <Badge variant="outline" className="text-green-600">
                +45 points
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium">Referral Bonus</p>
                <p className="text-sm text-muted-foreground">Nov 20, 2024</p>
              </div>
              <Badge variant="outline" className="text-green-600">
                +50 points
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
