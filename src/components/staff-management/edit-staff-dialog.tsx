"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"

interface Staff {
  id: string
  name: string
  email: string
  phone: string
  role: string
  hourlyRate: number
  specialties: string[]
}

interface EditStaffDialogProps {
  staff: Staff
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: () => void
}

export function EditStaffDialog({ staff, open, onOpenChange, onUpdate }: EditStaffDialogProps) {
  const [formData, setFormData] = useState({
    first_name: staff.name.split(" ")[0] || "",
    last_name: staff.name.split(" ")[1] || "",
    email: staff.email,
    phone: staff.phone,
    role: staff.role.toLowerCase().replace(" ", "-"),
    hourly_rate: staff.hourlyRate,
    specialties: staff.specialties.join(", "),
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()

    // Update profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role.replace("-", "_"),
      })
      .eq("id", staff.id)

    // Update staff record
    const { error: staffError } = await supabase
      .from("staff")
      .update({
        hourly_rate: formData.hourly_rate,
        specialties: formData.specialties.split(",").map((s) => s.trim()),
      })
      .eq("id", staff.id)

    if (!profileError && !staffError) {
      onUpdate()
      onOpenChange(false)
    }

    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-black">Edit Staff Member</DialogTitle>
          <DialogDescription className="text-gray-600">Update the staff member's information</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name" className="text-black">
                  First Name
                </Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, first_name: e.target.value }))}
                  className="border-gray-200 focus:border-black"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name" className="text-black">
                  Last Name
                </Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, last_name: e.target.value }))}
                  className="border-gray-200 focus:border-black"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-black">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                className="border-gray-200 focus:border-black"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-black">
                Phone
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                className="border-gray-200 focus:border-black"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-black">
                Role
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value }))}
              >
                <SelectTrigger className="border-gray-200 focus:border-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="senior-barber">Senior Barber</SelectItem>
                  <SelectItem value="master-barber">Master Barber</SelectItem>
                  <SelectItem value="junior-barber">Junior Barber</SelectItem>
                  <SelectItem value="receptionist">Receptionist</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hourly_rate" className="text-black">
                Hourly Rate
              </Label>
              <Input
                id="hourly_rate"
                type="number"
                value={formData.hourly_rate}
                onChange={(e) => setFormData((prev) => ({ ...prev, hourly_rate: Number.parseFloat(e.target.value) }))}
                className="border-gray-200 focus:border-black"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialties" className="text-black">
                Specialties
              </Label>
              <Textarea
                id="specialties"
                value={formData.specialties}
                onChange={(e) => setFormData((prev) => ({ ...prev, specialties: e.target.value }))}
                placeholder="e.g., Classic Cuts, Beard Styling, Color"
                className="border-gray-200 focus:border-black"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading} className="bg-black hover:bg-gray-800 text-white">
              {isLoading ? "Updating..." : "Update Staff Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
