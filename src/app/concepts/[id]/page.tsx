'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Calendar, Copy, Edit2, Trash2 } from 'lucide-react'
import { useSupabase } from '@/providers/supabase-provider'
import { getConceptClient, deleteConcept } from '@/lib/marketing-concepts'
import { getAudienceClient } from '@/lib/audiences'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import AppNavigation from '@/components/navigation/app-navigation'
import ConceptRemixer from '@/components/concepts/concept-remixer'
import { MarketingConcept } from '@/types/marketing-concept'
import { Audience } from '@/types/audience'

export default function ConceptPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useSupabase()
  const [concept, setConcept] = useState<MarketingConcept | null>(null)
  const [audience, setAudience] = useState<Audience | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!user || !params.id) return

    const fetchData = async () => {
      setLoading(true)
      
      try {
        const conceptResult = await getConceptClient(params.id as string, user.id)
        
        if (!conceptResult.success) {
          setError(conceptResult.error)
          return
        }

        if (!conceptResult.data) {
          setError('Concept not found')
          return
        }

        setConcept(conceptResult.data)

        // Fetch the audience data if audience_id exists (for backward compatibility)
        if (conceptResult.data.audience_id) {
          const audienceResult = await getAudienceClient(conceptResult.data.audience_id, user.id)
          if (audienceResult.success && audienceResult.data) {
            setAudience(audienceResult.data)
          }
        }
      } catch (err) {
        console.error('Error fetching concept:', err)
        setError('Failed to load concept')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, params.id])

  const handleDelete = async () => {
    if (!user || !concept) return
    
    setIsDeleting(true)
    try {
      const result = await deleteConcept(concept.id, user.id)
      
      if (result.success) {
        router.push('/concepts')
      } else {
        alert('Failed to delete concept: ' + result.error)
      }
    } catch (error) {
      console.error('Failed to delete concept:', error)
      alert('Failed to delete concept. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRemixSuccess = () => {
    router.push('/concepts')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppNavigation />
        <div className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading concept...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !concept) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppNavigation />
        <div className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Concept Not Found</h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button onClick={() => router.push('/concepts')}>
                Back to Concepts
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavigation title="Concept Details" customBackPath="/concepts" />
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {concept.title}
                </h1>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Created {formatDate(concept.created_at)}
                  </span>
                  
                  {concept.audience_snapshots && concept.audience_snapshots.length > 0 ? (
                    <span>
                      Target: {concept.audience_snapshots.map(a => a.name).join(', ')}
                    </span>
                  ) : audience ? (
                    <span>Target: {audience.name}</span>
                  ) : null}
                  
                  {concept.source_concept_id && (
                    <Badge variant="outline" className="text-xs">
                      <Copy className="w-3 h-3 mr-1" />
                      Remix
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Copy className="w-4 h-4 mr-2" />
                      Remix
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Remix Marketing Concept</DialogTitle>
                    </DialogHeader>
                    <ConceptRemixer 
                      originalConcept={concept}
                      onRemixSuccess={handleRemixSuccess}
                    />
                  </DialogContent>
                </Dialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" disabled={isDeleting}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Concept</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete &quot;{concept.title}&quot;? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete Concept
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Concept Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-base">
                    {concept.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {(concept.audience_snapshots && concept.audience_snapshots.length > 0) || audience ? (
              <Card>
                <CardHeader>
                  <CardTitle>Target Audience{concept.audience_snapshots && concept.audience_snapshots.length > 1 ? 's' : ''}</CardTitle>
                  <CardDescription>
                    This concept was generated for the following audience{concept.audience_snapshots && concept.audience_snapshots.length > 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {concept.audience_snapshots && concept.audience_snapshots.length > 0 ? (
                      concept.audience_snapshots.map((audienceSnapshot, index) => (
                        <div key={index} className="p-4 border rounded-lg bg-gray-50">
                          <h3 className="font-semibold text-gray-900 mb-2">{audienceSnapshot.name}</h3>
                          <p className="text-sm text-gray-600">
                            {audienceSnapshot.demographics && (
                              <>
                                {(() => {
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  const demo = audienceSnapshot.demographics as any
                                  return demo.age_range?.min && demo.age_range?.max &&
                                    `Ages ${demo.age_range.min}-${demo.age_range.max} • `
                                })()}
                                {(() => {
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  const demo = audienceSnapshot.demographics as any
                                  return demo.gender?.filter((g: string) => g !== 'All genders').join(', ')
                                })()}
                                {(() => {
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  const demo = audienceSnapshot.demographics as any
                                  return demo.location?.type && ` • ${demo.location.type} areas`
                                })()}
                              </>
                            )}
                          </p>
                          <div className="mt-2 text-xs text-gray-500">
                            Snapshot from concept creation
                          </div>
                        </div>
                      ))
                    ) : audience ? (
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">{audience.name}</h3>
                          <p className="text-sm text-gray-600">
                            {audience.demographics && (() => {
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              const demo = audience.demographics as any
                              return (
                                <>
                                  {demo.age_range?.min && demo.age_range?.max &&
                                    `Ages ${demo.age_range.min}-${demo.age_range.max} • `
                                  }
                                  {demo.gender?.filter((g: string) => g !== 'All genders').join(', ')}
                                  {demo.location?.type && ` • ${demo.location.type} areas`}
                                </>
                              )
                            })()}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/audiences/${audience.id}/edit`)}
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit Audience
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
