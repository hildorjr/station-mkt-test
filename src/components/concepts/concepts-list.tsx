'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sparkles, Trash2, Copy, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { useSupabase } from '@/providers/supabase-provider'
import { MarketingConcept } from '@/types/marketing-concept'
import { deleteConcept } from '@/lib/marketing-concepts'
import ConceptRemixer from '@/components/concepts/concept-remixer'
import ConceptGeneratorModal from '@/components/concepts/concept-generator-modal'

interface ConceptsListProps {
  initialConcepts: MarketingConcept[]
  onConceptsChange?: (concepts: MarketingConcept[]) => void
}

export default function ConceptsList({ initialConcepts, onConceptsChange }: ConceptsListProps) {
  const [concepts, setConcepts] = useState(initialConcepts)
  const [loading, setLoading] = useState<string | null>(null)
  const { user } = useSupabase()

  const handleDelete = async (conceptId: string) => {
    if (!user) return
    
    setLoading(conceptId)
    const result = await deleteConcept(conceptId, user.id)
    
    if (result.success) {
      const updatedConcepts = concepts.filter(concept => concept.id !== conceptId)
      setConcepts(updatedConcepts)
      onConceptsChange?.(updatedConcepts)
    } else {
      alert('Failed to delete concept: ' + result.error)
    }
    
    setLoading(null)
  }

  const handleRemixSuccess = (newConcept: MarketingConcept) => {
    const updatedConcepts = [newConcept, ...concepts]
    setConcepts(updatedConcepts)
    onConceptsChange?.(updatedConcepts)
  }

  const handleNewConcept = (newConcept: MarketingConcept) => {
    const updatedConcepts = [newConcept, ...concepts]
    setConcepts(updatedConcepts)
    onConceptsChange?.(updatedConcepts)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const truncateDescription = (description: string, maxLength: number = 150) => {
    if (description.length <= maxLength) return description
    return description.substring(0, maxLength) + '...'
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketing Concepts</h1>
          <p className="text-gray-600 mt-2">
            AI-generated marketing concepts based on your target audiences
          </p>
        </div>
        <ConceptGeneratorModal onConceptGenerated={handleNewConcept} />
      </div>

      {concepts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Sparkles className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No concepts yet</h3>
            <p className="text-gray-600 mb-6">
              Generate your first marketing concept from one of your audiences
            </p>
              <ConceptGeneratorModal onConceptGenerated={handleNewConcept} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {concepts.map((concept) => (
            <Card key={concept.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl mb-2 leading-tight">
                      {concept.title}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(concept.created_at)}
                      </span>
                      {concept.source_concept_id && (
                        <Badge variant="outline" className="text-xs">
                          <Copy className="w-3 h-3 mr-1" />
                          Remix
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" title="Remix Concept">
                          <Copy className="w-4 h-4" />
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
                        <Button variant="ghost" size="sm" disabled={loading === concept.id} title="Delete Concept">
                          <Trash2 className="w-4 h-4" />
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
                            onClick={() => handleDelete(concept.id)}
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
                <div className="prose prose-sm max-w-none text-gray-700 mb-4">
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {truncateDescription(concept.description)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Link href={`/concepts/${concept.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                  
                  {concept.description.length > 150 && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          Quick View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-2xl mb-4">
                            {concept.title}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="prose max-w-none">
                          <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                            {concept.description}
                          </p>
                        </div>
                        <div className="mt-6 pt-4 border-t text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Created {formatDate(concept.created_at)}
                          </span>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
