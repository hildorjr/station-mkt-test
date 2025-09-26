import AudienceForm from '@/components/audiences/audience-form'
import ProtectedRoute from '@/components/auth/protected-route'

export default function NewAudiencePage() {
  return (
    <ProtectedRoute>
      <AudienceForm mode="create" />
    </ProtectedRoute>
  )
}
