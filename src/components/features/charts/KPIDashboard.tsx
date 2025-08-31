'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'
import { motion } from 'framer-motion'

interface KPI {
  title: string
  value: string | number
  change: number
  changeType: 'positive' | 'negative' | 'neutral'
  icon: React.ReactNode
  color: string
  description?: string
}

interface KPIDashboardProps {
  kpis: KPI[]
  className?: string
}

export function KPIDashboard({ kpis, className = "" }: KPIDashboardProps) {
  const getChangeIcon = (change: number, changeType: string) => {
    if (changeType === 'positive' || change > 0) {
      return <Icons.barChart3 className="h-3 w-3" />
    } else if (changeType === 'negative' || change < 0) {
      return <Icons.x className="h-3 w-3" />
    }
    return <Icons.info className="h-3 w-3" />
  }

  const getChangeColor = (change: number, changeType: string) => {
    if (changeType === 'positive' || change > 0) {
      return 'text-green-600 bg-green-100'
    } else if (changeType === 'negative' || change < 0) {
      return 'text-red-600 bg-red-100'
    }
    return 'text-gray-600 bg-gray-100'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}
    >
      {kpis.map((kpi, index) => (
        <motion.div
          key={kpi.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {kpi.title}
              </CardTitle>
              <div className={`p-2 rounded-lg bg-opacity-20`} style={{ backgroundColor: kpi.color + '20' }}>
                {kpi.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800 mb-2">
                {typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}
              </div>

              <div className="flex items-center space-x-2 mb-2">
                <Badge className={`text-xs ${getChangeColor(kpi.change, kpi.changeType)}`}>
                  {getChangeIcon(kpi.change, kpi.changeType)}
                  <span className="ml-1">
                    {kpi.change > 0 ? '+' : ''}{kpi.change}%
                  </span>
                </Badge>
                <span className="text-xs text-gray-500">vs last period</span>
              </div>

              {kpi.description && (
                <p className="text-xs text-gray-500 mt-2">
                  {kpi.description}
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}
