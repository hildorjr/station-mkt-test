import { Audience } from '@/types/audience'

// OpenAI integration now uses server-side API routes for security

interface GenerateConceptOptions {
  audience: Audience
  campaignType?: string
  tone?: string
  additionalContext?: string
}

export async function generateMarketingConcept({ 
  audience, 
  campaignType = 'general marketing campaign',
  tone = 'engaging and persuasive',
  additionalContext = ''
}: GenerateConceptOptions): Promise<{ title: string; description: string }> {
  try {
    const response = await fetch('/api/generate-concept', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audience,
        campaignType,
        tone,
        additionalContext,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to generate concept')
    }

    const concept = await response.json()
    return concept
  } catch (error) {
    console.error('Error generating marketing concept:', error)
    
    // Fallback response
    return {
      title: `Campaign for ${audience.name}`,
      description: `A targeted marketing campaign designed for ${audience.name}. This concept focuses on reaching the audience through their preferred channels and addressing their specific interests and pain points.`
    }
  }
}

export async function remixMarketingConcept({
  originalConcept,
  audience,
  remixInstructions = 'Create a variation with a fresh perspective'
}: {
  originalConcept: { title: string; description: string }
  audience: Audience
  remixInstructions?: string
}): Promise<{ title: string; description: string }> {
  try {
    const response = await fetch('/api/remix-concept', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        originalConcept,
        audience,
        remixInstructions,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to remix concept')
    }

    const remixedConcept = await response.json()
    return remixedConcept
  } catch (error) {
    console.error('Error remixing marketing concept:', error)
    
    return {
      title: `${originalConcept.title} - Remix`,
      description: `${originalConcept.description}\n\nThis is a remixed version incorporating fresh ideas and approaches for the target audience.`
    }
  }
}

// Helper functions moved to server-side API routes for security
