'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Star, User, Calendar, Award, Zap, Award as CrownIcon, TrendingUp, Target as TargetIcon, Gift, Package } from '@/lib/icon-mapping';

interface LoyaltyData {
  points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  badges: Array<{
    badge: string;
    description: string;
    earnedAt: string;
  }>;
  totalSpent: number;
  referrals: Array<{
    referredEmail: string;
    referredAt: string;
    converted: boolean;
  }>;
}

interface TierConfig {
  name: string;
  minPoints: number;
  multiplier: number;
  benefits: string[];
  color: string;
}

interface NextTier {
  tier: string;
  name: string;
  pointsNeeded: number;
}

interface LoyaltyProgramProps {
  userId: string;
}

const TIER_CONFIGS: Record<string, TierConfig> = {
  bronze: {
    name: 'Bronze',
    minPoints: 0,
    multiplier: 1,
    benefits: ['Standard points earning', 'Basic rewards'],
    color: '#cd7f32',
  },
  silver: {
    name: 'Silver',
    minPoints: 100,
    multiplier: 1.2,
    benefits: ['20% bonus points', 'Priority booking', 'Free consultations'],
    color: '#c0c0c0',
  },
  gold: {
    name: 'Gold',
    minPoints: 500,
    multiplier: 1.5,
    benefits: ['50% bonus points', 'VIP treatment', 'Exclusive events', 'Free products'],
    color: '#ffd700',
  },
  platinum: {
    name: 'Platinum',
    minPoints: 1000,
    multiplier: 2,
    benefits: ['100% bonus points', 'Personal stylist', 'All benefits', 'Lifetime perks'],
    color: '#e5e4e2',
  },
};

const BADGE_ICONS: Record<string, any> = {
  'First Visit': Calendar,
  'Loyal Client': Star,
  'Regular Customer': User,
  'Event Attendee': Award,
  'Product Enthusiast': Gift,
  'Referrer': User,
  'High Spender': CrownIcon,
  'Anniversary': Award,
};

export default function LoyaltyProgram({ userId }: LoyaltyProgramProps) {
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null);
  const [nextTier, setNextTier] = useState<NextTier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLoyaltyData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/loyalty?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch loyalty data');
      
      const data = await response.json();
      setLoyaltyData(data.loyalty);
      setNextTier(data.nextTier);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load loyalty data');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchLoyaltyData();
  }, [fetchLoyaltyData, userId]);

  const getTierConfig = (tier: string) => {
    return TIER_CONFIGS[tier] || TIER_CONFIGS.bronze;
  };

  const getProgressToNextTier = () => {
    if (!loyaltyData || !nextTier) return 0;
    
    const currentTier = getTierConfig(loyaltyData.tier);
    const nextTierConfig = getTierConfig(nextTier.tier);
    
    const pointsInCurrentTier = loyaltyData.points - currentTier.minPoints;
    const pointsNeededForNextTier = nextTierConfig.minPoints - currentTier.minPoints;
    
    return Math.min((pointsInCurrentTier / pointsNeededForNextTier) * 100, 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <Button onClick={fetchLoyaltyData} variant="outline" className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  if (!loyaltyData) {
    return (
      <div className="text-center py-12">
        <Award className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Loyalty Data</h3>
        <p className="text-gray-500">Start earning points with your first appointment!</p>
      </div>
    );
  }

  const currentTier = getTierConfig(loyaltyData.tier);
  const progressToNext = getProgressToNextTier();

  return (
    <div className="space-y-6">
      {/* Current Tier Status */}
      <Card className="relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10"
          style={{ backgroundColor: currentTier.color }}
        ></div>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CrownIcon className="h-6 w-6" style={{ color: currentTier.color }} />
                {currentTier.name} Tier
              </CardTitle>
              <CardDescription>
                {loyaltyData.points} total points • {currentTier.multiplier}x point multiplier
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold" style={{ color: currentTier.color }}>
                {loyaltyData.points}
              </div>
              <div className="text-sm text-gray-500">Points</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {nextTier && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Progress to {nextTier.name}</span>
                <span>{loyaltyData.points}/{nextTier.minPoints} points</span>
              </div>
              <Progress value={progressToNext} className="h-2" />
              <p className="text-sm text-gray-600">
                {nextTier.pointsNeeded} more points needed for {nextTier.name} tier
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tier Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Your Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentTier.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Badges Earned ({loyaltyData.badges.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loyaltyData.badges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loyaltyData.badges.map((badge, index) => {
                const IconComponent = BADGE_ICONS[badge.badge] || Award;
                return (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="p-2 bg-yellow-100 rounded-full">
                      <IconComponent className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{badge.badge}</div>
                      <div className="text-xs text-gray-500">{badge.description}</div>
                      <div className="text-xs text-gray-400">
                        Earned {formatDate(badge.earnedAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No badges earned yet. Keep using our services to earn badges!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Spent */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(loyaltyData.totalSpent)}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Lifetime spending at ModernMen
            </p>
          </CardContent>
        </Card>

        {/* Referrals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {loyaltyData.referrals.length}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {loyaltyData.referrals.filter(r => r.converted).length} converted
            </p>
          </CardContent>
        </Card>
      </div>

      {/* How to Earn Points */}
      <Card>
        <CardHeader>
          <CardTitle>How to Earn Points</CardTitle>
          <CardDescription>
            Different ways to accumulate loyalty points
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Appointment</div>
                <div className="text-sm text-gray-500">Complete a service</div>
              </div>
              <Badge variant="secondary">+10 pts</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Product Purchase</div>
                <div className="text-sm text-gray-500">Buy grooming products</div>
              </div>
              <Badge variant="secondary">+$1 = 1 pt</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Event Attendance</div>
                <div className="text-sm text-gray-500">Join workshops/events</div>
              </div>
              <Badge variant="secondary">+25 pts</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Referral</div>
                <div className="text-sm text-gray-500">Refer a friend</div>
              </div>
              <Badge variant="secondary">+50 pts</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Tier Preview */}
      {nextTier && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TargetIcon className="h-5 w-5" />
              Next Tier: {nextTier.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Earn {nextTier.pointsNeeded} more points to unlock {nextTier.name} benefits:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {TIER_CONFIGS[nextTier.tier].benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                    <span className="text-gray-500">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
