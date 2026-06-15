import AdminLayout from '../../components/Admin/AdminLayout'

export default function AdminCalendar() {
  return (
    <AdminLayout>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0 0 8px', letterSpacing: '-0.02em', fontFamily: "'Space Grotesk', sans-serif" }}>Shared Calendar</h1>
        <p style={{ color: '#94A3B8', fontSize: '1.1rem', fontWeight: 500 }}>View team appointments and schedule client meetings.</p>
      </div>

      <div style={{ 
        background: '#0a0a0a', 
        border: '1px solid rgba(255, 255, 255, 0.1)', 
        borderRadius: '24px', 
        padding: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        overflow: 'hidden'
      }}>
        <div style={{ 
          position: 'relative', 
          width: '100%', 
          borderRadius: '16px', 
          overflow: 'hidden', 
          border: '1px solid rgba(255,255,255,0.05)',
          background: '#111'
        }}>
          <iframe 
            src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ1QPv4EeVy2duOD95DWsndpXHj5szlOnQob7iBc2pSm0hX00QceACDO3PhdsNGin5Kupdyfa1N-?gv=true" 
            style={{ border: 0, width: '100%', height: '700px', display: 'block' }}
            frameBorder="0"
          ></iframe>
        </div>
      </div>
    </AdminLayout>
  )
}
