"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Plus, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AddLoyaltyProgramDialogProps {
  onProgramAdded?: () => void
}

export function AddLoyaltyProgramDialog({ onProgramAdded }: AddLoyaltyProgramDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "points",
    pointsPerDollar: 1,
    minimumSpend: 0,
    tierThresholds: {
      bronze: 0,
      silver: 500,
      gold: 1000,
      platinum: 2500
    },
    benefits: {
      bronze: "",
      silver: "",
      gold: "", 
      platinum: ""
    },
    isActive: true,
    allowMultiplier: false,
    multiplierDays: [] as string[]
  })

  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Create loyalty program logic would go here
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulated API call

      toast({
        title: "Program Created",
        description: `${formData.name} loyalty program has been created successfully.`,
      })

      // Reset form
      setFormData({
        name: "",
        description: "",
        type: "points",
        pointsPerDollar: 1,
        minimumSpend: 0,
        tierThresholds: {
          bronze: 0,
          silver: 500,
          gold: 1000,
          platinum: 2500
        },
        benefits: {
          bronze: "",
          silver: "",
          gold: "",
          platinum: ""
        },
        isActive: true,
        allowMultiplier: false,
        multiplierDays: []
      })

      setOpen(false)
      onProgramAdded?.()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create loyalty program",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Program
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Loyalty Program</DialogTitle>
          <DialogDescription>
            Set up a new loyalty program to reward your customers.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Program Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="VIP Rewards Program"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Earn points with every visit and unlock exclusive rewards..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Program Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="points">Points System</SelectItem>
                    <SelectItem value="visits">Visit Counter</SelectItem>
                    <SelectItem value="spend">Spend Tiers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pointsPerDollar">Points per Dollar</Label>
                <Input
                  id="pointsPerDollar"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.pointsPerDollar}
                  onChange={(e) => setFormData(prev => ({ ...prev, pointsPerDollar: parseFloat(e.target.value) }))}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="minimumSpend">Minimum Spend to Earn Points</Label>
              <Input
                id="minimumSpend"
                type="number"
                min="0"
                value={formData.minimumSpend}
                onChange={(e) => setFormData(prev => ({ ...prev, minimumSpend: parseInt(e.target.value) }))}
                placeholder="0"
              />
            </div>

            <div className="space-y-4">
              <Label className="text-base font-semibold">Tier Thresholds (Points)</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bronze">Bronze Tier</Label>
                  <Input
                    id="bronze"
                    type="number"
                    value={formData.tierThresholds.bronze}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      tierThresholds: { ...prev.tierThresholds, bronze: parseInt(e.target.value) }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="silver">Silver Tier</Label>
                  <Input
                    id="silver"
                    type="number"
                    value={formData.tierThresholds.silver}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      tierThresholds: { ...prev.tierThresholds, silver: parseInt(e.target.value) }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="gold">Gold Tier</Label>
                  <Input
                    id="gold"
                    type="number"
                    value={formData.tierThresholds.gold}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      tierThresholds: { ...prev.tierThresholds, gold: parseInt(e.target.value) }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="platinum">Platinum Tier</Label>
                  <Input
                    id="platinum"
                    type="number"
                    value={formData.tierThresholds.platinum}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      tierThresholds: { ...prev.tierThresholds, platinum: parseInt(e.target.value) }
                    }))}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="isActive">Program is active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Program
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}