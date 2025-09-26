'use client'

import { useState, useEffect, useCallback } from 'react'
import { Sparkles, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useSupabase } from '@/providers/supabase-provider'
import { Audience } from '@/types/audience'
import { MarketingConcept } from '@/types/marketing-concept'
import { generateMarketingConcept } from '@/lib/openai'
import { createConceptWithSnapshots } from '@/lib/marketing-concepts'
import { getAudiencesClient } from '@/lib/audiences'

interface ConceptGeneratorModalProps {
  onConceptGenerated?: (concept: MarketingConcept) => void
}

export default function ConceptGeneratorModal({ onConceptGenerated }: ConceptGeneratorModalProps) {
  const { user } = useSupabase()
  const [open, setOpen] = useState(false)
  const [audiences, setAudiences] = useState<Audience[]>([])
  const [selectedAudienceIds, setSelectedAudienceIds] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [campaignType, setCampaignType] = useState('general marketing campaign')
  const [tone, setTone] = useState('engaging and persuasive')
  const [additionalContext, setAdditionalContext] = useState('')
  const [generatedConcept, setGeneratedConcept] = useState<{ title: string; description: string } | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [loadingAudiences, setLoadingAudiences] = useState(false)

  const loadAudiences = useCallback(async () => {
    if (!user) return
    
    setLoadingAudiences(true)
    try {
      const result = await getAudiencesClient(user.id)
      if (result.success) {
        setAudiences(result.data)
      } else {
        console.error('Failed to load audiences:', result.error)
      }
    } catch (error) {
      console.error('Failed to load audiences:', error)
    } finally {
      setLoadingAudiences(false)
    }
  }, [user])

  // Load audiences when modal opens
  useEffect(() => {
    if (open && user) {
      loadAudiences()
    }
  }, [open, user, loadAudiences])

  const handleAudienceToggle = (audienceId: string) => {
    setSelectedAudienceIds(prev => 
      prev.includes(audienceId)
        ? prev.filter(id => id !== audienceId)
        : [...prev, audienceId]
    )
  }

  const getSelectedAudiences = () => {
    return audiences.filter(audience => selectedAudienceIds.includes(audience.id))
  }

  const handleGenerate = async () => {
    if (!user || selectedAudienceIds.length === 0) return

    setIsGenerating(true)
    try {
      const selectedAudiences = getSelectedAudiences()
      
      // For now, use the first audience for generation (we can enhance this later to merge audience data)
      const primaryAudience = selectedAudiences[0]
      
      const concept = await generateMarketingConcept({
        audience: primaryAudience,
        campaignType,
        tone,
        additionalContext: `${additionalContext}${selectedAudiences.length > 1 ? `\n\nTarget multiple audiences: ${selectedAudiences.map(a => a.name).join(', ')}` : ''}`
      })
      
      setGeneratedConcept(concept)
    } catch (error) {
      console.error('Failed to generate concept:', error)
      alert('Failed to generate marketing concept. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!user || !generatedConcept || selectedAudienceIds.length === 0) return

    setIsSaving(true)
    try {
      const selectedAudiences = getSelectedAudiences()
      
      const result = await createConceptWithSnapshots({
        title: generatedConcept.title,
        description: generatedConcept.description,
        audience_ids: selectedAudienceIds,
        audience_snapshots: selectedAudiences
      }, user.id)

      if (result.success) {
        alert('Concept saved successfully!')
        setGeneratedConcept(null)
        setSelectedAudienceIds([])
        setAdditionalContext('')
        onConceptGenerated?.(result.data)
        setOpen(false)
      } else {
        alert('Failed to save concept: ' + result.error)
      }
    } catch (error) {
      console.error('Failed to save concept:', error)
      alert('Failed to save concept. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setGeneratedConcept(null)
    setSelectedAudienceIds([])
    setAdditionalContext('')
    setCampaignType('general marketing campaign')
    setTone('engaging and persuasive')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">
          <Sparkles className="w-4 h-4 mr-2" />
          Generate New Concept
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Marketing Concept</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {!generatedConcept ? (
            <>
              {/* Audience Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Target Audiences</CardTitle>
                  <CardDescription>
                    Choose one or more audiences for this marketing concept
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingAudiences ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Loading audiences...</p>
                    </div>
                  ) : audiences.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-600 mb-4">No audiences found. Create an audience first.</p>
                      <Button variant="outline" onClick={() => setOpen(false)}>
                        Create Audience
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                      {audiences.map((audience) => (
                        <div key={audience.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                          <Checkbox
                            id={audience.id}
                            checked={selectedAudienceIds.includes(audience.id)}
                            onCheckedChange={() => handleAudienceToggle(audience.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <label htmlFor={audience.id} className="text-sm font-medium cursor-pointer block">
                              {audience.name}
                            </label>
                            <p className="text-xs text-gray-500 truncate">
                              {audience.demographics?.age_range && 
                                `Ages ${audience.demographics.age_range.min || '?'}-${audience.demographics.age_range.max || '?'}`
                              }
                              {audience.demographics?.gender?.filter(g => g !== 'All genders').join(', ')}
                            </p>
                          </div>
                          {selectedAudienceIds.includes(audience.id) && (
                            <Check className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {selectedAudienceIds.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>{selectedAudienceIds.length} audience{selectedAudienceIds.length > 1 ? 's' : ''} selected:</strong> {getSelectedAudiences().map(a => a.name).join(', ')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Generation Options */}
              <Card>
                <CardHeader>
                  <CardTitle>Concept Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Campaign Type</label>
                      <Select value={campaignType} onValueChange={setCampaignType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general marketing campaign">General Marketing Campaign</SelectItem>
                          <SelectItem value="social media campaign">Social Media Campaign</SelectItem>
                          <SelectItem value="email marketing campaign">Email Marketing Campaign</SelectItem>
                          <SelectItem value="content marketing strategy">Content Marketing Strategy</SelectItem>
                          <SelectItem value="product launch campaign">Product Launch Campaign</SelectItem>
                          <SelectItem value="brand awareness campaign">Brand Awareness Campaign</SelectItem>
                          <SelectItem value="lead generation campaign">Lead Generation Campaign</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Tone</label>
                      <Select value={tone} onValueChange={setTone}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="engaging and persuasive">Engaging & Persuasive</SelectItem>
                          <SelectItem value="friendly and approachable">Friendly & Approachable</SelectItem>
                          <SelectItem value="professional and trustworthy">Professional & Trustworthy</SelectItem>
                          <SelectItem value="energetic and exciting">Energetic & Exciting</SelectItem>
                          <SelectItem value="educational and informative">Educational & Informative</SelectItem>
                          <SelectItem value="humorous and entertaining">Humorous & Entertaining</SelectItem>
                          <SelectItem value="luxurious and premium">Luxurious & Premium</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Additional Context (Optional)</label>
                    <Textarea
                      placeholder="Any specific requirements, products, services, or goals for this campaign..."
                      value={additionalContext}
                      onChange={(e) => setAdditionalContext(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>

                  <Button 
                    onClick={handleGenerate} 
                    disabled={isGenerating || selectedAudienceIds.length === 0}
                    className="w-full"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Concept...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Marketing Concept
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  Generated Concept
                </CardTitle>
                <CardDescription>
                  For audiences: {getSelectedAudiences().map(a => a.name).join(', ')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
                  <h3 className="font-bold text-xl mb-3 text-gray-900">
                    {generatedConcept.title}
                  </h3>
                  <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                    {generatedConcept.description}
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
                      'Save Concept'
                    )}
                  </Button>
                  
                  <Button 
                    onClick={handleReset}
                    variant="outline"
                    className="flex-1"
                  >
                    Generate Another
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
