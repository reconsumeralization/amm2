import React from 'react'

export const ModernMenBranding: React.FC = () => {
  return (
    <div style={{
      padding: '2rem',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #f5f5dc, #ffffff)',
      minHeight: '100vh'
    }}>
      {/* Header Section */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #1e40af, #8b4513, #d4af37)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '1rem',
            boxShadow: '0 4px 12px rgba(30, 64, 175, 0.3)'
          }}>
            <span style={{ fontSize: '1.8rem', color: 'white' }}>✂</span>
          </div>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #1e40af, #8b4513, #d4af37)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            Modern Men Salon
          </h1>
        </div>
        <p style={{
          color: '#6b7280',
          fontSize: '1.2rem',
          fontWeight: '500',
          margin: 0
        }}>
          Professional Salon Management System
        </p>
      </div>

      {/* Welcome Section */}
      <div style={{
        background: 'linear-gradient(135deg, #1e40af, #8b4513, #d4af37)',
        color: 'white',
        padding: '3rem 2rem',
        borderRadius: '16px',
        marginBottom: '3rem',
        boxShadow: '0 8px 24px rgba(30, 64, 175, 0.2)'
      }}>
        <h2 style={{
          marginBottom: '1rem',
          fontSize: '2rem',
          fontWeight: '600'
        }}>
          Welcome to Your Management Dashboard
        </h2>
        <p style={{
          opacity: 0.9,
          fontSize: '1.1rem',
          marginBottom: '2rem'
        }}>
          Streamline your salon operations with our comprehensive management system
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          fontSize: '0.9rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'block' }}>📅</span>
            <strong>Appointments</strong>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'block' }}>👥</span>
            <strong>Customers</strong>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'block' }}>✂</span>
            <strong>Services</strong>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'block' }}>💼</span>
            <strong>Commissions</strong>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        marginBottom: '3rem'
      }}>
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
          textAlign: 'left'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            background: 'linear-gradient(135deg, #1e40af, #8b4513)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <span style={{ fontSize: '1.5rem', color: 'white' }}>📅</span>
          </div>
          <h3 style={{ color: '#1e40af', marginBottom: '0.5rem', fontSize: '1.3rem' }}>Appointment Management</h3>
          <p style={{ color: '#6b7280', fontSize: '1rem', lineHeight: '1.5' }}>
            Schedule appointments, track availability, and manage bookings with ease.
            Send automated reminders and handle rescheduling mlessly.
          </p>
        </div>

        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
          textAlign: 'left'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            background: 'linear-gradient(135deg, #8b4513, #d4af37)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <span style={{ fontSize: '1.5rem', color: 'white' }}>💇</span>
          </div>
          <h3 style={{ color: '#8b4513', marginBottom: '0.5rem', fontSize: '1.3rem' }}>Service Catalog</h3>
          <p style={{ color: '#6b7280', fontSize: '1rem', lineHeight: '1.5' }}>
            Define services with detailed pricing, durations, and categories.
            Track service performance and optimize your offerings.
          </p>
        </div>

        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
          textAlign: 'left'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            background: 'linear-gradient(135deg, #d4af37, #1e40af)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <span style={{ fontSize: '1.5rem', color: 'white' }}>👥</span>
          </div>
          <h3 style={{ color: '#d4af37', marginBottom: '0.5rem', fontSize: '1.3rem' }}>Customer Management</h3>
          <p style={{ color: '#6b7280', fontSize: '1rem', lineHeight: '1.5' }}>
            Build customer profiles, track loyalty programs, and maintain detailed
            client history for personalized service.
          </p>
        </div>

        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
          textAlign: 'left'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            background: 'linear-gradient(135deg, #10b981, #1e40af)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <span style={{ fontSize: '1.5rem', color: 'white' }}>💼</span>
          </div>
          <h3 style={{ color: '#10b981', marginBottom: '0.5rem', fontSize: '1.3rem' }}>Commission Tracking</h3>
          <p style={{ color: '#6b7280', fontSize: '1rem', lineHeight: '1.5' }}>
            Automated commission calculations, payment tracking, and detailed
            reporting for your stylist team.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '2rem 0',
        borderTop: '1px solid #e2e8f0',
        color: '#6b7280'
      }}>
        <p style={{ margin: 0, fontSize: '0.9rem' }}>
          Modern Men Salon Management System • Professional • Reliable • Efficient
        </p>
      </div>
    </div>
  )
}
