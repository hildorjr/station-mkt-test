'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/providers/supabase-provider'
import { getConceptsClient } from '@/lib/marketing-concepts'
import ConceptsList from '@/components/concepts/concepts-list'
import AppNavigation from '@/components/navigation/app-navigation'
import ProtectedRoute from '@/components/auth/protected-route'
import { MarketingConcept } from '@/types/marketing-concept'

export default function ConceptsPage() {
  return (
    <ProtectedRoute>
      <ConceptsContent />
    </ProtectedRoute>
  )
}

function ConceptsContent() {
  const { user } = useSupabase()
  const [concepts, setConcepts] = useState<MarketingConcept[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchConcepts = async () => {
      setDataLoading(true)
      const result = await getConceptsClient(user.id)
      
      if (result.success) {
        setConcepts(result.data)
      } else {
        setError(result.error)
      }
      
      setDataLoading(false)
    }

    fetchConcepts()
  }, [user])

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppNavigation showBackButton={false} />
        <div className="py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading marketing concepts...</p>
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
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Concepts</h1>
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
          <ConceptsList 
            initialConcepts={concepts} 
            onConceptsChange={setConcepts}
          />
        </div>
      </div>
    </div>
  )
}
