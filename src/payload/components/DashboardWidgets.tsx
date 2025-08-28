import React from 'react'
import { Card, Heading, Text } from '@payloadcms/ui'

interface MetricCardProps {
  title: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  icon?: string
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, trend, icon }) => {
  const trendColor = trend === 'up' ? 'text-green-600' :
                    trend === 'down' ? 'text-red-600' : 'text-gray-600'

  return (
    <Card className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <Text className="text-sm font-medium text-gray-600">{title}</Text>
          <Heading className="text-2xl font-bold text-gray-900 mt-1">{value}</Heading>
          {change && (
            <Text className={`text-sm mt-1 ${trendColor}`}>
              {trend === 'up' && '↗'} {trend === 'down' && '↘'} {change}
            </Text>
          )}
        </div>
        {icon && <div className="text-3xl">{icon}</div>}
      </div>
    </Card>
  )
}

interface AppointmentCardProps {
  appointment: any
  customer: any
  stylist: any
  service: any
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  customer,
  stylist,
  service
}) => {
  const appointmentTime = new Date(appointment.dateTime).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  const statusColors = {
    confirmed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800'
  }

  return (
    <Card className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Text className="font-medium text-gray-900">
              {customer?.firstName} {customer?.lastName}
            </Text>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[appointment.status]}`}>
              {appointment.status}
            </span>
          </div>
          <Text className="text-sm text-gray-600 mt-1">
            {service?.name} with {stylist?.name}
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            {appointmentTime}
          </Text>
        </div>
      </div>
    </Card>
  )
}

interface LowStockAlertProps {
  product: any
}

const LowStockAlert: React.FC<LowStockAlertProps> = ({ product }) => {
  return (
    <Card className="p-4 bg-red-50 rounded-lg border border-red-200">
      <div className="flex items-center justify-between">
        <div>
          <Text className="font-medium text-red-900">{product.name}</Text>
          <Text className="text-sm text-red-700">
            Only {product.currentStock} {product.unit} remaining
          </Text>
        </div>
        <div className="text-red-600">⚠</div>
      </div>
    </Card>
  )
}

export const DashboardWidgets: React.FC = () => {
  // In a real implementation, these would be fetched from the API
  const mockData = {
    todayAppointments: 12,
    todayRevenue: 240000, // $2400.00 in cents
    totalCustomers: 234,
    lowStockItems: 3,
    recentAppointments: [
      {
        id: '1',
        dateTime: new Date().toISOString(),
        status: 'confirmed',
        customer: { firstName: 'Sarah', lastName: 'Johnson' },
        stylist: { name: 'Emma Davis' },
        service: { name: 'Hair Cut & Style' }
      },
      {
        id: '2',
        dateTime: new Date(Date.now() + 3600000).toISOString(),
        status: 'in-progress',
        customer: { firstName: 'Mike', lastName: 'Chen' },
        stylist: { name: 'David Wilson' },
        service: { name: 'Men\'s Haircut' }
      }
    ],
    lowStockProducts: [
      { name: 'Professional Shampoo', currentStock: 2, unit: 'bottles' },
      { name: 'Hair Color - Brunette', currentStock: 1, unit: 'bottles' },
      { name: 'Styling Gel', currentStock: 3, unit: 'tubes' }
    ]
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100)
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Today's Appointments"
          value={mockData.todayAppointments}
          change="+2 from yesterday"
          trend="up"
          icon="📅"
        />
        <MetricCard
          title="Today's Revenue"
          value={formatCurrency(mockData.todayRevenue)}
          change="+12% from yesterday"
          trend="up"
          icon="💰"
        />
        <MetricCard
          title="Total Customers"
          value={mockData.totalCustomers}
          change="+5 this month"
          trend="up"
          icon="👥"
        />
        <MetricCard
          title="Low Stock Items"
          value={mockData.lowStockItems}
          trend="neutral"
          icon="📦"
        />
      </div>

      {/* Today's Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <Heading className="text-lg font-semibold text-gray-900 mb-4">
            Today's Appointments
          </Heading>
          <div className="space-y-3">
            {mockData.recentAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                customer={appointment.customer}
                stylist={appointment.stylist}
                service={appointment.service}
              />
            ))}
          </div>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <Heading className="text-lg font-semibold text-gray-900 mb-4">
            Low Stock Alerts
          </Heading>
          <div className="space-y-3">
            {mockData.lowStockProducts.map((product, index) => (
              <LowStockAlert key={index} product={product} />
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <Heading className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </Heading>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 text-blue-700 font-medium transition-colors">
            + New Appointment
          </button>
          <button className="p-3 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 text-green-700 font-medium transition-colors">
            + New Customer
          </button>
          <button className="p-3 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 text-purple-700 font-medium transition-colors">
            📊 View Reports
          </button>
          <button className="p-3 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 text-orange-700 font-medium transition-colors">
            ⚙ Manage Inventory
          </button>
        </div>
      </Card>
    </div>
  )
}
