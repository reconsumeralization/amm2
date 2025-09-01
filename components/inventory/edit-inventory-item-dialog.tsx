'use client'

import { useState, useEffect } from 'react'
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2 } from '@/lib/icon-mapping'
import { useInventory } from '@/hooks/useInventory'
import type { InventoryItem } from '@/hooks/useInventory'

interface EditInventoryItemDialogProps {
  item: InventoryItem
  onClose: () => void
  onSuccess: () => void
}

export function EditInventoryItemDialog({ item, onClose, onSuccess }: EditInventoryItemDialogProps) {
  const [formData, setFormData] = useState({
    name: item.name,
    description: item.description || '',
    sku: item.sku,
    category: item.category,
    brand: item.brand || '',
    unitPrice: item.unitPrice.toString(),
    retailPrice: item.retailPrice?.toString() || '',
    currentStock: item.currentStock.toString(),
    minStock: item.minStock.toString(),
    maxStock: item.maxStock?.toString() || '',
    unitOfMeasure: item.unitOfMeasure,
    location: item.location || '',
    isActive: item.isActive,
    notes: item.notes || ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { updateItem } = useInventory()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate required fields
      if (!formData.name || !formData.sku || !formData.category || !formData.unitPrice ||
          !formData.currentStock || !formData.minStock || !formData.unitOfMeasure) {
        throw new Error('Please fill in all required fields')
      }

      // Convert string values to numbers
      const itemData = {
        name: formData.name,
        description: formData.description || undefined,
        sku: formData.sku,
        category: formData.category,
        brand: formData.brand || undefined,
        unitPrice: parseFloat(formData.unitPrice),
        retailPrice: formData.retailPrice ? parseFloat(formData.retailPrice) : undefined,
        currentStock: parseInt(formData.currentStock),
        minStock: parseInt(formData.minStock),
        maxStock: formData.maxStock ? parseInt(formData.maxStock) : undefined,
        unitOfMeasure: formData.unitOfMeasure,
        location: formData.location || undefined,
        isActive: formData.isActive,
        notes: formData.notes || undefined
      }

      await updateItem(item.id, itemData)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Edit Inventory Item</DialogTitle>
        <DialogDescription>
          Update the details for {item.name}. Changes will be saved immediately.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name *</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Product name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-sku">SKU *</Label>
            <Input
              id="edit-sku"
              value={formData.sku}
              onChange={(e) => handleInputChange('sku', e.target.value)}
              placeholder="Unique SKU"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-description">Description</Label>
          <Textarea
            id="edit-description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Product description"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-category">Category *</Label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hair_products">Hair Products</SelectItem>
                <SelectItem value="styling_tools">Styling Tools</SelectItem>
                <SelectItem value="skin_care">Skin Care</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
                <SelectItem value="consumables">Consumables</SelectItem>
                <SelectItem value="cleaning_supplies">Cleaning Supplies</SelectItem>
                <SelectItem value="uniforms">Uniforms</SelectItem>
                <SelectItem value="marketing_materials">Marketing Materials</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-brand">Brand</Label>
            <Input
              id="edit-brand"
              value={formData.brand}
              onChange={(e) => handleInputChange('brand', e.target.value)}
              placeholder="Brand name"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-unitPrice">Unit Price *</Label>
            <Input
              id="edit-unitPrice"
              type="number"
              step="0.01"
              value={formData.unitPrice}
              onChange={(e) => handleInputChange('unitPrice', e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-retailPrice">Retail Price</Label>
            <Input
              id="edit-retailPrice"
              type="number"
              step="0.01"
              value={formData.retailPrice}
              onChange={(e) => handleInputChange('retailPrice', e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-currentStock">Current Stock *</Label>
            <Input
              id="edit-currentStock"
              type="number"
              value={formData.currentStock}
              onChange={(e) => handleInputChange('currentStock', e.target.value)}
              placeholder="0"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-minStock">Min Stock *</Label>
            <Input
              id="edit-minStock"
              type="number"
              value={formData.minStock}
              onChange={(e) => handleInputChange('minStock', e.target.value)}
              placeholder="0"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-maxStock">Max Stock</Label>
            <Input
              id="edit-maxStock"
              type="number"
              value={formData.maxStock}
              onChange={(e) => handleInputChange('maxStock', e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-unitOfMeasure">Unit of Measure *</Label>
            <Select value={formData.unitOfMeasure} onValueChange={(value) => handleInputChange('unitOfMeasure', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="each">Each</SelectItem>
                <SelectItem value="pack">Pack</SelectItem>
                <SelectItem value="box">Box</SelectItem>
                <SelectItem value="case">Case</SelectItem>
                <SelectItem value="bottle">Bottle</SelectItem>
                <SelectItem value="tube">Tube</SelectItem>
                <SelectItem value="can">Can</SelectItem>
                <SelectItem value="roll">Roll</SelectItem>
                <SelectItem value="set">Set</SelectItem>
                <SelectItem value="kit">Kit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-location">Location</Label>
            <Input
              id="edit-location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Storage location"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-notes">Notes</Label>
          <Textarea
            id="edit-notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Additional notes"
            rows={2}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="edit-isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => handleInputChange('isActive', checked as boolean)}
          />
          <Label htmlFor="edit-isActive">Item is active and available for use</Label>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Update Item
          </Button>
        </div>
      </form>
    </DialogContent>
  )
}
