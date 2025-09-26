'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/providers/supabase-provider'
import { getAudienceClient } from '@/lib/audiences'
import AudienceForm from '@/components/audiences/audience-form'
import ProtectedRoute from '@/components/auth/protected-route'
import { AudienceFormData } from '@/types/audience'

interface EditAudiencePageProps {
  params: Promise<{ id: string }>
}

export default function EditAudiencePage({ params }: EditAudiencePageProps) {
  return (
    <ProtectedRoute>
      <EditAudienceContent params={params} />
    </ProtectedRoute>
  )
}

function EditAudienceContent({ params }: EditAudiencePageProps) {
  const { user } = useSupabase()
  const router = useRouter()
  const [audienceId, setAudienceId] = useState<string | null>(null)
  const [formData, setFormData] = useState<AudienceFormData | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    params.then(({ id }) => setAudienceId(id))
  }, [params])

  useEffect(() => {
    if (!audienceId || !user) return

    const fetchAudience = async () => {
      setDataLoading(true)
      const result = await getAudienceClient(audienceId, user.id)
      
      if (result.success && result.data) {
        const audienceData = result.data

        // Transform audience data to form format
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const demographics = (audienceData.demographics as any) || {}
        const transformedFormData: AudienceFormData = {
          name: audienceData.name,
          age_min: demographics.age_range?.min,
          age_max: demographics.age_range?.max,
          gender: demographics.gender || [],
          location_type: demographics.location?.type,
          regions: demographics.location?.regions || [],
          education: demographics.education || [],
          income_level: demographics.income_level || [],
          interests: demographics.interests || [],
          hobbies: demographics.hobbies || [],
          brands_they_love: demographics.brands_they_love || [],
          shopping_behavior: demographics.shopping_behavior || [],
          media_consumption: demographics.media_consumption || [],
          tech_usage: demographics.tech_usage || [],
          pain_points: demographics.pain_points || [],
          aspirations: demographics.aspirations || [],
          additional_notes: demographics.additional_notes || '',
        }
        
        setFormData(transformedFormData)
      } else {
        setError('Audience not found')
      }
      
      setDataLoading(false)
    }

    fetchAudience()
  }, [user, audienceId])

  if (dataLoading || !formData || !audienceId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading audience...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => router.push('/audiences')}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              ← Back to Audiences
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <AudienceForm mode="edit" audienceId={audienceId} initialData={formData} />
}
