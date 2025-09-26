'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { useSupabase } from '@/providers/supabase-provider'
import { Audience } from '@/types/audience'
import { deleteAudience, generateAudienceSummary } from '@/lib/audiences'

interface AudiencesListProps {
  initialAudiences: Audience[]
}

export default function AudiencesList({ initialAudiences }: AudiencesListProps) {
  const [audiences, setAudiences] = useState(initialAudiences)
  const [loading, setLoading] = useState<string | null>(null)
  const { user } = useSupabase()

  const handleDelete = async (audienceId: string) => {
    if (!user) return
    
    setLoading(audienceId)
    const result = await deleteAudience(audienceId, user.id)
    
    if (result.success) {
      setAudiences(prev => prev.filter(audience => audience.id !== audienceId))
    } else {
      alert('Failed to delete audience: ' + result.error)
    }
    
    setLoading(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getAudienceHighlights = (audience: Audience) => {
    const highlights: string[] = []
    const demo = audience.demographics
    
    if (demo.age_range?.min || demo.age_range?.max) {
      const ageStr = demo.age_range.min && demo.age_range.max 
        ? `${demo.age_range.min}-${demo.age_range.max}`
        : demo.age_range.min 
          ? `${demo.age_range.min}+`
          : `<${demo.age_range.max}`
      highlights.push(ageStr)
    }
    
    if (demo.gender && demo.gender.length > 0 && !demo.gender.includes('All genders')) {
      highlights.push(demo.gender[0])
    }
    
    if (demo.location?.type) {
      highlights.push(demo.location.type)
    }
    
    if (demo.education && demo.education.length > 0) {
      highlights.push(demo.education[0])
    }
    
    return highlights.slice(0, 3)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audiences</h1>
          <p className="text-gray-600 mt-2">
            Manage your target audiences for marketing campaigns
          </p>
        </div>
        <Link href="/audiences/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Audience
          </Button>
        </Link>
      </div>

      {audiences.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No audiences yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first audience to start generating targeted marketing concepts
            </p>
            <Link href="/audiences/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Audience
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {audiences.map((audience) => (
            <Card key={audience.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{audience.name}</CardTitle>
                    <CardDescription className="mt-1">
                      Created {formatDate(audience.created_at)}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Link href={`/audiences/${audience.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" disabled={loading === audience.id}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Audience</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete &quot;{audience.name}&quot;? This action cannot be undone. Any existing marketing concepts using this audience will retain their data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(audience.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2 overflow-hidden">
                  {generateAudienceSummary(audience)}
                </p>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {getAudienceHighlights(audience).map((highlight, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {highlight}
                    </Badge>
                  ))}
                </div>

                {audience.demographics.interests && audience.demographics.interests.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Interests:</p>
                    <div className="flex flex-wrap gap-1">
                      {audience.demographics.interests.slice(0, 3).map((interest, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                      {audience.demographics.interests.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{audience.demographics.interests.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
