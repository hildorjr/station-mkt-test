'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/providers/supabase-provider'
import { getAudiencesClient } from '@/lib/audiences'
import AudiencesList from '@/components/audiences/audiences-list'
import AppNavigation from '@/components/navigation/app-navigation'
import ProtectedRoute from '@/components/auth/protected-route'
import { Audience } from '@/types/audience'

export default function AudiencesPage() {
  return (
    <ProtectedRoute>
      <AudiencesContent />
    </ProtectedRoute>
  )
}

function AudiencesContent() {
  const { user } = useSupabase()
  const [audiences, setAudiences] = useState<Audience[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchAudiences = async () => {
      setDataLoading(true)
      const result = await getAudiencesClient(user.id)
      
      if (result.success) {
        setAudiences(result.data)
      } else {
        setError(result.error)
      }
      
      setDataLoading(false)
    }

    fetchAudiences()
  }, [user])

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppNavigation showBackButton={false} />
        <div className="py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading audiences...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppNavigation showBackButton={false} />
        <div className="py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Audiences</h1>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavigation showBackButton={false} />
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AudiencesList initialAudiences={audiences} />
        </div>
      </div>
    </div>
  )
}
