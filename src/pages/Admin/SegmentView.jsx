import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/Admin/AdminLayout'
import LeadBank from '../../components/Admin/LeadBank'

export default function SegmentView() {
  const { id } = useParams()
  const [segment, setSegment] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSegment() {
      setLoading(true)
      const { data, error } = await supabase.from('segments').select('*').eq('id', id).single()
      if (!error) setSegment(data)
      setLoading(false)
    }
    fetchSegment()
  }, [id])

  if (loading) return (
    <AdminLayout>
      <div style={{ color: '#94A3B8', padding: '40px' }}>Loading segment details...</div>
    </AdminLayout>
  )

  if (!segment) return (
    <AdminLayout>
      <div style={{ color: '#ef4444', padding: '40px' }}>Segment not found.</div>
    </AdminLayout>
  )

  return (
    <AdminLayout>
      <LeadBank 
        title={`Segment: ${segment.name}`}
        subtitle={`Filtered view for ${segment.name}.`}
        filters={segment.filter_criteria}
      />
    </AdminLayout>
  )
}
