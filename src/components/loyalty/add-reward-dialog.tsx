'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useLoyaltyRewards } from '@/hooks/useLoyaltyRewards'
import { Loader2 } from '@/lib/icon-mapping'

interface AddRewardDialogProps {
  onClose: () => void
  onSuccess: () => void
}

export function AddRewardDialog({ onClose, onSuccess }: AddRewardDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'discount_percentage' as const,
    pointsRequired: '',
    value: '',
    maxRedemptions: ''
  })
  const [loading, setLoading] = useState(false)

  const { createReward } = useLoyaltyRewards()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await createReward({
        name: formData.name,
        description: formData.description || undefined,
        type: formData.type,
        pointsRequired: parseInt(formData.pointsRequired),
        value: formData.value ? parseFloat(formData.value) : undefined,
        isActive: true,
        maxRedemptions: formData.maxRedemptions ? parseInt(formData.maxRedemptions) : undefined,
        redemptionsUsed: 0
      })

      onSuccess()
    } catch (error) {
      console.error('Error creating reward:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Add New Reward</DialogTitle>
        <DialogDescription>
          Create a new loyalty reward that customers can redeem with their points.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Reward Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="e.g., 10% Discount"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe what this reward offers..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Reward Type</Label>
          <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select reward type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="discount_percentage">Percentage Discount</SelectItem>
              <SelectItem value="discount_fixed">Fixed Amount Discount</SelectItem>
              <SelectItem value="free_service">Free Service</SelectItem>
              <SelectItem value="free_product">Free Product</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pointsRequired">Points Required</Label>
          <Input
            id="pointsRequired"
            type="number"
            value={formData.pointsRequired}
            onChange={(e) => handleInputChange('pointsRequired', e.target.value)}
            placeholder="100"
            min="1"
            required
          />
        </div>

        {(formData.type === 'discount_percentage' || formData.type === 'discount_fixed') && (
          <div className="space-y-2">
            <Label htmlFor="value">
              {formData.type === 'discount_percentage' ? 'Discount Percentage (%)' : 'Discount Amount ($)'}
            </Label>
            <Input
              id="value"
              type="number"
              value={formData.value}
              onChange={(e) => handleInputChange('value', e.target.value)}
              placeholder={formData.type === 'discount_percentage' ? '10' : '5.00'}
              min="0"
              step={formData.type === 'discount_percentage' ? '1' : '0.01'}
              required
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="maxRedemptions">Maximum Redemptions (Optional)</Label>
          <Input
            id="maxRedemptions"
            type="number"
            value={formData.maxRedemptions}
            onChange={(e) => handleInputChange('maxRedemptions', e.target.value)}
            placeholder="Leave empty for unlimited"
            min="1"
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Reward
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}