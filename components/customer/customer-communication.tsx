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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageCircle, Mail, Phone, Send } from "lucide-react"

interface Customer {
  id: string
  name: string
  email: string
  phone: string
}

interface CustomerCommunicationProps {
  customer: Customer
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CustomerCommunication({ customer, open, onOpenChange }: CustomerCommunicationProps) {
  const [communicationType, setCommunicationType] = useState<"email" | "sms" | "call">("email")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    setIsLoading(true)
    // Here you would integrate with your communication service (email, SMS, etc.)
    // For now, we'll just simulate the action
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
    onOpenChange(false)
    // Reset form
    setSubject("")
    setMessage("")
  }

  const getTemplates = () => {
    switch (communicationType) {
      case "email":
        return [
          {
            label: "Appointment Reminder",
            value:
              "Hi {name}, this is a reminder about your appointment tomorrow at {time}. Looking forward to seeing you!",
          },
          {
            label: "Thank You",
            value: "Hi {name}, thank you for visiting us today! We hope you love your new look. See you next time!",
          },
          {
            label: "Special Offer",
            value: "Hi {name}, we have a special offer just for you! Book your next appointment and get 20% off.",
          },
        ]
      case "sms":
        return [
          {
            label: "Appointment Reminder",
            value: "Hi {name}, reminder: appointment tomorrow at {time}. Reply CONFIRM to confirm.",
          },
          { label: "Thank You", value: "Thanks for visiting us today, {name}! Hope you love your new look!" },
          { label: "Special Offer", value: "Special offer for {name}: 20% off your next appointment! Book now." },
        ]
      default:
        return []
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-black">
            <MessageCircle className="h-5 w-5" />
            Contact {customer.name}
          </DialogTitle>
          <DialogDescription className="text-gray-600">Send a message to your customer</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-black">Communication Type</Label>
            <Select value={communicationType} onValueChange={(value: any) => setCommunicationType(value)}>
              <SelectTrigger className="border-gray-200 focus:border-black">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                </SelectItem>
                <SelectItem value="sms">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    SMS
                  </div>
                </SelectItem>
                <SelectItem value="call">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Call
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {communicationType !== "call" && (
            <>
              <div className="space-y-2">
                <Label className="text-black">Quick Templates</Label>
                <Select onValueChange={(value) => setMessage(value)}>
                  <SelectTrigger className="border-gray-200 focus:border-black">
                    <SelectValue placeholder="Choose a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {getTemplates().map((template, index) => (
                      <SelectItem key={index} value={template.value}>
                        {template.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {communicationType === "email" && (
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-black">
                    Subject
                  </Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Email subject"
                    className="border-gray-200 focus:border-black"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="message" className="text-black">
                  Message
                </Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Type your ${communicationType} message here...`}
                  rows={4}
                  className="border-gray-200 focus:border-black"
                />
              </div>
            </>
          )}

          {communicationType === "call" && (
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <Phone className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">Ready to call {customer.name}?</p>
              <p className="font-medium text-black">{customer.phone}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-gray-200">
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isLoading} className="bg-black hover:bg-gray-800 text-white">
            <Send className="w-4 h-4 mr-2" />
            {isLoading
              ? "Sending..."
              : communicationType === "call"
                ? "Call Now"
                : `Send ${communicationType.toUpperCase()}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
