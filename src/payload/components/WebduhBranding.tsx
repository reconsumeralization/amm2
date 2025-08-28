import React from 'react'

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
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
          {change && (
            <p className={`text-sm mt-1 ${trendColor}`}>
              {trend === 'up' && '↗'} {trend === 'down' && '↘'} {change}
            </p>
          )}
        </div>
        {icon && <div className="text-3xl">{icon}</div>}
      </div>
    </div>
  )
}

export const WebduhBranding: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg">
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2">🌐 Webduh</h1>
          <p className="text-xl opacity-90">Web Designs Unite Humanity</p>
          <p className="text-sm opacity-75 mt-2">Creating Digital Solutions That Make a Difference</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl mb-2">🎨</div>
            <h3 className="font-semibold">Design Excellence</h3>
            <p className="text-sm opacity-80">Beautiful, user-centered designs</p>
          </div>
          <div>
            <div className="text-2xl mb-2">💻</div>
            <h3 className="font-semibold">Technical Innovation</h3>
            <p className="text-sm opacity-80">Cutting-edge development solutions</p>
          </div>
          <div>
            <div className="text-2xl mb-2">🤝</div>
            <h3 className="font-semibold">Human Impact</h3>
            <p className="text-sm opacity-80">Technology that serves humanity</p>
          </div>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-purple-900 mb-3">
            Our Mission
          </h2>
          <p className="text-purple-800 leading-relaxed">
            At Webduh, we believe that great design and technology should be accessible to everyone.
            Our goal is to create digital solutions that not only look beautiful but also make a positive
            impact on people&apos;s lives. Every project we work on is an opportunity to unite technology
            with humanity&apos;s needs.
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Projects Completed"
          value="150+"
          change="+12 this month"
          trend="up"
          icon="🚀"
        />
        <MetricCard
          title="Happy Clients"
          value="98%"
          change="Satisfaction rate"
          trend="up"
          icon="😊"
        />
        <MetricCard
          title="Countries Served"
          value="25+"
          change="Global reach"
          trend="up"
          icon="🌍"
        />
        <MetricCard
          title="Team Members"
          value="12"
          change="Growing family"
          trend="up"
          icon="👥"
        />
      </div>

      {/* Services Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            🎯 Our Services
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <span className="text-blue-600">🌐</span>
              <div>
                <p className="font-medium text-gray-900">Web Development</p>
                <p className="text-sm text-gray-600">Modern, responsive websites</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-purple-600">📱</span>
              <div>
                <p className="font-medium text-gray-900">Mobile Apps</p>
                <p className="text-sm text-gray-600">iOS and Android solutions</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-green-600">🎨</span>
              <div>
                <p className="font-medium text-gray-900">UI/UX Design</p>
                <p className="text-sm text-gray-600">User-centered design experiences</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-orange-600">⚡</span>
              <div>
                <p className="font-medium text-gray-900">Digital Strategy</p>
                <p className="text-sm text-gray-600">Technology consulting & planning</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            💡 Our Values
          </h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <span className="text-red-500 mt-1">❤️</span>
              <div>
                <p className="font-medium text-gray-900">Human-Centered</p>
                <p className="text-sm text-gray-600">Every solution starts with people</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-blue-500 mt-1">🎯</span>
              <div>
                <p className="font-medium text-gray-900">Excellence</p>
                <p className="text-sm text-gray-600">Quality in every pixel and line of code</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-500 mt-1">🤝</span>
              <div>
                <p className="font-medium text-gray-900">Collaboration</p>
                <p className="text-sm text-gray-600">Working together to achieve greatness</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-purple-500 mt-1">🌱</span>
              <div>
                <p className="font-medium text-gray-900">Growth</p>
                <p className="text-sm text-gray-600">Continuous learning and improvement</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🚀 Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 text-blue-700 font-medium transition-colors">
            + New Project
          </button>
          <button className="p-3 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 text-green-700 font-medium transition-colors">
            📊 View Analytics
          </button>
          <button className="p-3 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 text-purple-700 font-medium transition-colors">
            👥 Client Portal
          </button>
          <button className="p-3 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 text-orange-700 font-medium transition-colors">
            ⚙ Settings
          </button>
        </div>
      </div>
    </div>
  )
}
