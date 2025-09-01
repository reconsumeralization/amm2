import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, AlertTriangle, CheckCircle, XCircle, DollarSign } from '@/lib/icon-mapping'
import type { InventoryItem } from '@/hooks/useInventory'

interface InventoryStatsProps {
  items: InventoryItem[]
}

export function InventoryStats({ items }: InventoryStatsProps) {
  const stats = {
    totalItems: items.length,
    inStock: items.filter(item => item.status === 'in_stock').length,
    lowStock: items.filter(item => item.status === 'low_stock').length,
    outOfStock: items.filter(item => item.status === 'out_of_stock').length,
    totalValue: items.reduce((total, item) => total + (item.unitPrice * item.currentStock), 0)
  }

  const statCards = [
    {
      title: 'Total Items',
      value: stats.totalItems,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'In Stock',
      value: stats.inStock,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Low Stock',
      value: stats.lowStock,
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100'
    },
    {
      title: 'Out of Stock',
      value: stats.outOfStock,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Total Value',
      value: `$${stats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={`p-2 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            {typeof stat.value === 'number' && stat.title !== 'Total Items' && stats.totalItems > 0 && (
              <p className="text-xs text-muted-foreground">
                {((stat.value / stats.totalItems) * 100).toFixed(1)}% of total
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
