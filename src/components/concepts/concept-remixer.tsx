'use client'

import { useState } from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useSupabase } from '@/providers/supabase-provider'
import { MarketingConcept } from '@/types/marketing-concept'
import { remixMarketingConcept } from '@/lib/openai'
import { createConceptWithSnapshots } from '@/lib/marketing-concepts'
import { getAudienceClient } from '@/lib/audiences'

interface ConceptRemixerProps {
  originalConcept: MarketingConcept
  onRemixSuccess?: (newConcept: MarketingConcept) => void
}

export default function ConceptRemixer({ originalConcept, onRemixSuccess }: ConceptRemixerProps) {
  const { user } = useSupabase()
  const [isRemixing, setIsRemixing] = useState(false)
  const [remixInstructions, setRemixInstructions] = useState('')
  const [remixedConcept, setRemixedConcept] = useState<{ title: string; description: string } | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleRemix = async () => {
    if (!user) return

    setIsRemixing(true)
    try {
      // Use audience snapshot if available, otherwise try to fetch from audience_id
      let audienceData = null
      
      if (originalConcept.audience_snapshots && originalConcept.audience_snapshots.length > 0) {
        // Use the first audience snapshot
        audienceData = originalConcept.audience_snapshots[0]
      } else if (originalConcept.audience_id) {
        // Fallback to fetching audience data
        const audienceResult = await getAudienceClient(originalConcept.audience_id, user.id)
        if (audienceResult.success && audienceResult.data) {
          audienceData = audienceResult.data
        }
      }
      
      if (!audienceData) {
        alert('Unable to find audience data for remixing. The original audience may have been deleted.')
        return
      }

      const concept = await remixMarketingConcept({
        originalConcept: {
          title: originalConcept.title,
          description: originalConcept.description
        },
        audience: audienceData,
        remixInstructions: remixInstructions || 'Create a variation with a fresh perspective'
      })
      
      setRemixedConcept(concept)
    } catch (error) {
      console.error('Failed to remix concept:', error)
      alert('Failed to remix marketing concept. Please try again.')
    } finally {
      setIsRemixing(false)
    }
  }

  const handleSave = async () => {
    if (!user || !remixedConcept) return

    setIsSaving(true)
    try {
      // Create remix with same audience snapshots as original
      const result = await createConceptWithSnapshots({
        title: remixedConcept.title,
        description: remixedConcept.description,
        audience_ids: originalConcept.audience_id ? [originalConcept.audience_id] : [],
        audience_snapshots: originalConcept.audience_snapshots || [],
        source_concept_id: originalConcept.id
      }, user.id)

      if (result.success) {
        alert('Remixed concept saved successfully!')
        setRemixedConcept(null)
        setRemixInstructions('')
        onRemixSuccess?.(result.data)
      } else {
        alert('Failed to save remixed concept: ' + result.error)
      }
    } catch (error) {
      console.error('Failed to save remixed concept:', error)
      alert('Failed to save concept. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemixNew = () => {
    setRemixedConcept(null)
  }

  return (
    <div className="space-y-6">
      {/* Original Concept */}
      <Card className="bg-gray-50 border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">Original Concept</CardTitle>
        </CardHeader>
        <CardContent>
          <h3 className="font-semibold text-gray-900 mb-2">{originalConcept.title}</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {originalConcept.description.length > 200 
              ? originalConcept.description.substring(0, 200) + '...'
              : originalConcept.description
            }
          </p>
        </CardContent>
      </Card>

      {!remixedConcept ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              Remix Instructions
            </CardTitle>
            <CardDescription>
                Tell the AI how you&apos;d like to remix this concept
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Remix Instructions (Optional)</label>
              <Textarea
                placeholder="e.g., Make it more casual and fun, Focus on younger demographics, Add social media elements, Make it more premium/luxury, etc."
                value={remixInstructions}
                onChange={(e) => setRemixInstructions(e.target.value)}
                className="min-h-[100px]"
              />
              <p className="text-xs text-gray-500 mt-2">
                Leave blank for a general creative variation
              </p>
            </div>

            <Button 
              onClick={handleRemix} 
              disabled={isRemixing}
              className="w-full"
              size="lg"
            >
              {isRemixing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Remixing Concept...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Remix This Concept
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              Remixed Concept
            </CardTitle>
            <CardDescription>
              Here&apos;s your AI-generated remix
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border">
              <h3 className="font-bold text-xl mb-3 text-gray-900">
                {remixedConcept.title}
              </h3>
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                {remixedConcept.description}
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Remixed Concept'
                )}
              </Button>
              
              <Button 
                onClick={handleRemixNew}
                variant="outline"
                className="flex-1"
              >
                Remix Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
