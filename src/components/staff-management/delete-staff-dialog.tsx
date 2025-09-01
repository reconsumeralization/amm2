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
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { AlertTriangle } from "lucide-react"

interface DeleteStaffDialogProps {
  staffId: string
  staffName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onDelete: () => void
}

export function DeleteStaffDialog({ staffId, staffName, open, onOpenChange, onDelete }: DeleteStaffDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)
    const supabase = createClient()

    // Soft delete by setting is_active to false
    const { error } = await supabase.from("staff").update({ is_active: false }).eq("id", staffId)

    if (!error) {
      onDelete()
      onOpenChange(false)
    }

    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Staff Member
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Are you sure you want to remove <strong>{staffName}</strong> from the staff? This action will deactivate
            their account but preserve their historical data.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-gray-200">
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? "Removing..." : "Remove Staff Member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
