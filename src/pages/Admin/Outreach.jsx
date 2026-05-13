import AdminLayout from '../../components/Admin/AdminLayout'
import LeadBank from '../../components/Admin/LeadBank'

export default function OutreachLeads() {
  return (
    <AdminLayout>
      <LeadBank 
        title="Lead Bank / Outreach" 
        subtitle="Manage and promote your scraped potential leads."
      />
    </AdminLayout>
  )
}
