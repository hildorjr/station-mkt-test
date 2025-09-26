import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/api'
import { Audience } from '@/types/audience'

// Initialize OpenAI with server-side API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Server-side only
})

// Validation schema for request body
const remixConceptSchema = z.object({
  originalConcept: z.object({
    title: z.string(),
    description: z.string(),
  }),
  audience: z.object({
    id: z.string(),
    name: z.string(),
    demographics: z.any(), // JSONB data
  }),
  remixInstructions: z.string().optional().default('Create a variation with a fresh perspective'),
})

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = createClient(request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to remix concepts' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = remixConceptSchema.parse(body)

    // Verify user owns the audience (security check)
    const { data: audienceCheck, error: audienceError } = await supabase
      .from('audiences')
      .select('id')
      .eq('id', validatedData.audience.id)
      .eq('user_id', user.id)
      .single()

    if (audienceError || !audienceCheck) {
      return NextResponse.json(
        { error: 'Forbidden - You can only remix concepts for your own audiences' },
        { status: 403 }
      )
    }

    // Remix concept using OpenAI
    const remixedConcept = await remixMarketingConcept({
      originalConcept: validatedData.originalConcept,
      audience: validatedData.audience as Audience,
      remixInstructions: validatedData.remixInstructions,
    })

    // Log API usage
    await logApiUsage(user.id, 'concept_remix', request)

    return NextResponse.json(remixedConcept)
  } catch (error) {
    console.error('Error remixing concept:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to remix marketing concept. Please try again.' },
      { status: 500 }
    )
  }
}

async function remixMarketingConcept({
  originalConcept,
  audience,
  remixInstructions = 'Create a variation with a fresh perspective'
}: {
  originalConcept: { title: string; description: string }
  audience: Audience
  remixInstructions?: string
}): Promise<{ title: string; description: string }> {
  const audienceDescription = buildAudienceDescription(audience)
  
  const prompt = `Remix and improve this existing marketing concept:

Original Title: ${originalConcept.title}
Original Description: ${originalConcept.description}

Target Audience: ${audienceDescription}
Remix Instructions: ${remixInstructions}

Create a new variation that:
- Maintains the core appeal but offers a fresh angle
- Better resonates with the target audience
- Incorporates new creative elements or approaches

IMPORTANT: You must respond with ONLY valid JSON in this exact format:
{
  "title": "Your new title here",
  "description": "Your new detailed description here"
}

Do not include any other text, explanations, or markdown formatting. Only return the JSON object.`

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert marketing strategist. You must respond ONLY with valid JSON containing 'title' and 'description' fields. No other text, explanations, or formatting allowed. Always start with { and end with }."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.9,
      max_tokens: 800
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    const parsed = parseAIResponse(response)
    
    return {
      title: parsed.title || `${originalConcept.title} - Remix`,
      description: parsed.description || originalConcept.description
    }
  } catch (error) {
    console.error('Error remixing marketing concept:', error)
    
    return {
      title: `${originalConcept.title} - Remix`,
      description: `${originalConcept.description}\n\nThis is a remixed version incorporating fresh ideas and approaches for the target audience.`
    }
  }
}

function buildAudienceDescription(audience: Audience): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const demo = (audience.demographics as any) || {}
  const parts: string[] = []

  parts.push(`Name: ${audience.name}`)

  // Demographics
  if (demo.age_range?.min || demo.age_range?.max) {
    const ageStr = demo.age_range.min && demo.age_range.max 
      ? `${demo.age_range.min}-${demo.age_range.max} years old`
      : demo.age_range.min 
        ? `${demo.age_range.min}+ years old`
        : `under ${demo.age_range.max} years old`
    parts.push(`Age: ${ageStr}`)
  }

  if (demo.gender && demo.gender.length > 0 && !demo.gender.includes('All genders')) {
    parts.push(`Gender: ${demo.gender.join(', ')}`)
  }

  if (demo.location?.type) {
    parts.push(`Location: ${demo.location.type} areas`)
  }

  if (demo.location?.regions && demo.location.regions.length > 0) {
    parts.push(`Regions: ${demo.location.regions.join(', ')}`)
  }

  if (demo.education && demo.education.length > 0) {
    parts.push(`Education: ${demo.education.join(', ')}`)
  }

  if (demo.income_level && demo.income_level.length > 0) {
    parts.push(`Income: ${demo.income_level.join(', ')}`)
  }

  // Interests and lifestyle
  if (demo.interests && demo.interests.length > 0) {
    parts.push(`Interests: ${demo.interests.join(', ')}`)
  }

  if (demo.hobbies && demo.hobbies.length > 0) {
    parts.push(`Hobbies: ${demo.hobbies.join(', ')}`)
  }

  if (demo.brands_they_love && demo.brands_they_love.length > 0) {
    parts.push(`Favorite Brands: ${demo.brands_they_love.join(', ')}`)
  }

  // Behavior
  if (demo.shopping_behavior && demo.shopping_behavior.length > 0) {
    parts.push(`Shopping Behavior: ${demo.shopping_behavior.join(', ')}`)
  }

  if (demo.media_consumption && demo.media_consumption.length > 0) {
    parts.push(`Media Consumption: ${demo.media_consumption.join(', ')}`)
  }

  if (demo.tech_usage && demo.tech_usage.length > 0) {
    parts.push(`Technology Usage: ${demo.tech_usage.join(', ')}`)
  }

  // Psychology
  if (demo.pain_points && demo.pain_points.length > 0) {
    parts.push(`Pain Points: ${demo.pain_points.join(', ')}`)
  }

  if (demo.aspirations && demo.aspirations.length > 0) {
    parts.push(`Goals/Aspirations: ${demo.aspirations.join(', ')}`)
  }

  if (demo.additional_notes) {
    parts.push(`Additional Notes: ${demo.additional_notes}`)
  }

  return parts.join(' | ')
}

function parseAIResponse(response: string): { title: string; description: string } {
  try {
    // First, try direct JSON parsing
    return JSON.parse(response.trim())
  } catch {
    // If that fails, try to extract JSON from the response
    console.warn('Initial JSON parse failed, attempting to extract JSON from response')
    
    try {
      // Look for JSON-like content between braces
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const jsonString = jsonMatch[0]
        return JSON.parse(jsonString)
      }
      
      // If no braces found, try to extract title and description manually
      const titleMatch = response.match(/(?:title["']*:\s*["'])(.*?)["']/i)
      const descMatch = response.match(/(?:description["']*:\s*["'])(.*?)["'](?:\s*[,}])/i)
      
      if (titleMatch && descMatch) {
        return {
          title: titleMatch[1].trim(),
          description: descMatch[1].trim()
        }
      }
      
      throw new Error('Could not extract title and description from response')
      
    } catch (extractError) {
      console.error('Failed to extract JSON from response:', extractError)
      console.error('Original response:', response)
      
      // Last resort: return a structured response based on the raw content
      const lines = response.split('\n').filter(line => line.trim())
      const title = lines[0]?.replace(/[{}"':,]/g, '').trim().substring(0, 60) || 'Generated Marketing Concept'
      const description = lines.slice(1).join(' ').replace(/[{}'"]/g, '').trim() || response.trim()
      
      return { title, description }
    }
  }
}

// Optional: Log API usage for monitoring
async function logApiUsage(userId: string, operation: string, request: NextRequest) {
  try {
    // Log to console for now - can be replaced with proper logging service
    console.log(`API Usage: User ${userId} performed ${operation} at ${new Date().toISOString()}`)
    
    // Uncomment when api_usage_logs table is created and types are regenerated
    // const supabase = createClient(request)
    // await supabase
    //   .from('api_usage_logs')
    //   .insert({
    //     user_id: userId,
    //     operation,
    //     timestamp: new Date().toISOString(),
    //   })
  } catch (error) {
    // Don't fail the request if logging fails
    console.warn('Failed to log API usage:', error)
  }
}
