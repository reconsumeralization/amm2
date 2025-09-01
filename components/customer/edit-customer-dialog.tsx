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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  notes: string
  preferredBarber: string
  hairType?: string
  allergies?: string
}

interface EditCustomerDialogProps {
  customer: Customer
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: () => void
}

export function EditCustomerDialog({ customer, open, onOpenChange, onUpdate }: EditCustomerDialogProps) {
  const [formData, setFormData] = useState({
    first_name: customer.name.split(" ")[0] || "",
    last_name: customer.name.split(" ")[1] || "",
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    notes: customer.notes,
    preferred_barber_id: customer.preferredBarber,
    hair_type: customer.hairType || "",
    allergies: customer.allergies || "",
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
      })
      .eq("id", customer.id)

    // Update customer record
    const { error: customerError } = await supabase
      .from("customers")
      .update({
        hair_type: formData.hair_type,
        allergies: formData.allergies,
        notes: formData.notes,
        preferred_barber_id: formData.preferred_barber_id,
      })
      .eq("id", customer.id)

    if (!profileError && !customerError) {
      onUpdate()
      onOpenChange(false)
    }

    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-black">Edit Customer Profile</DialogTitle>
          <DialogDescription className="text-gray-600">Update customer information and preferences</DialogDescription>
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
              <Label htmlFor="hair_type" className="text-black">
                Hair Type
              </Label>
              <Select
                value={formData.hair_type}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, hair_type: value }))}
              >
                <SelectTrigger className="border-gray-200 focus:border-black">
                  <SelectValue placeholder="Select hair type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="straight">Straight</SelectItem>
                  <SelectItem value="wavy">Wavy</SelectItem>
                  <SelectItem value="curly">Curly</SelectItem>
                  <SelectItem value="coily">Coily</SelectItem>
                  <SelectItem value="fine">Fine</SelectItem>
                  <SelectItem value="thick">Thick</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="allergies" className="text-black">
                Allergies
              </Label>
              <Input
                id="allergies"
                value={formData.allergies}
                onChange={(e) => setFormData((prev) => ({ ...prev, allergies: e.target.value }))}
                placeholder="Any known allergies or sensitivities"
                className="border-gray-200 focus:border-black"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-black">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Preferences, special requests, etc."
                className="border-gray-200 focus:border-black"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading} className="bg-black hover:bg-gray-800 text-white">
              {isLoading ? "Updating..." : "Update Customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
