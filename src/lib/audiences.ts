import { getBrowserSupabase, handleDatabaseError, handleDatabaseSuccess, DatabaseResponse } from '@/lib/db-utils'
import { Audience, AudienceFormData } from '@/types/audience'

// Client-side operations

export async function getAudiencesClient(userId: string): Promise<DatabaseResponse<Audience[]>> {
  try {
    const supabase = getBrowserSupabase()
    const { data, error } = await supabase
      .from('audiences')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return handleDatabaseSuccess(data || [])
  } catch (error) {
    return handleDatabaseError(error)
  }
}

export async function getAudienceClient(id: string, userId: string): Promise<DatabaseResponse<Audience | null>> {
  try {
    const supabase = getBrowserSupabase()
    const { data, error } = await supabase
      .from('audiences')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error) throw error
    return handleDatabaseSuccess(data)
  } catch (error) {
    return handleDatabaseError(error)
  }
}

export async function createAudience(formData: AudienceFormData, userId: string): Promise<DatabaseResponse<Audience>> {
  try {
    const supabase = getBrowserSupabase()
    
    // Transform form data to demographics JSON
    const demographics = {
      age_range: formData.age_min || formData.age_max ? {
        min: formData.age_min,
        max: formData.age_max
      } : undefined,
      gender: formData.gender.length > 0 ? formData.gender : undefined,
      location: {
        type: formData.location_type,
        regions: formData.regions.length > 0 ? formData.regions : undefined
      },
      education: formData.education.length > 0 ? formData.education : undefined,
      income_level: formData.income_level.length > 0 ? formData.income_level : undefined,
      interests: formData.interests.length > 0 ? formData.interests : undefined,
      hobbies: formData.hobbies.length > 0 ? formData.hobbies : undefined,
      brands_they_love: formData.brands_they_love.length > 0 ? formData.brands_they_love : undefined,
      shopping_behavior: formData.shopping_behavior.length > 0 ? formData.shopping_behavior : undefined,
      media_consumption: formData.media_consumption.length > 0 ? formData.media_consumption : undefined,
      tech_usage: formData.tech_usage.length > 0 ? formData.tech_usage : undefined,
      pain_points: formData.pain_points.length > 0 ? formData.pain_points : undefined,
      aspirations: formData.aspirations.length > 0 ? formData.aspirations : undefined,
      additional_notes: formData.additional_notes
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('audiences')
      .insert({
        name: formData.name,
        demographics,
        user_id: userId
      })
      .select()
      .single()

    if (error) throw error
    return handleDatabaseSuccess(data)
  } catch (error) {
    return handleDatabaseError(error)
  }
}

export async function updateAudience(id: string, formData: AudienceFormData, userId: string): Promise<DatabaseResponse<Audience>> {
  try {
    const supabase = getBrowserSupabase()
    
    // Transform form data to demographics JSON
    const demographics = {
      age_range: formData.age_min || formData.age_max ? {
        min: formData.age_min,
        max: formData.age_max
      } : undefined,
      gender: formData.gender.length > 0 ? formData.gender : undefined,
      location: {
        type: formData.location_type,
        regions: formData.regions.length > 0 ? formData.regions : undefined
      },
      education: formData.education.length > 0 ? formData.education : undefined,
      income_level: formData.income_level.length > 0 ? formData.income_level : undefined,
      interests: formData.interests.length > 0 ? formData.interests : undefined,
      hobbies: formData.hobbies.length > 0 ? formData.hobbies : undefined,
      brands_they_love: formData.brands_they_love.length > 0 ? formData.brands_they_love : undefined,
      shopping_behavior: formData.shopping_behavior.length > 0 ? formData.shopping_behavior : undefined,
      media_consumption: formData.media_consumption.length > 0 ? formData.media_consumption : undefined,
      tech_usage: formData.tech_usage.length > 0 ? formData.tech_usage : undefined,
      pain_points: formData.pain_points.length > 0 ? formData.pain_points : undefined,
      aspirations: formData.aspirations.length > 0 ? formData.aspirations : undefined,
      additional_notes: formData.additional_notes
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('audiences')
      .update({
        name: formData.name,
        demographics
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return handleDatabaseSuccess(data)
  } catch (error) {
    return handleDatabaseError(error)
  }
}

export async function deleteAudience(id: string, userId: string): Promise<DatabaseResponse<void>> {
  try {
    const supabase = getBrowserSupabase()
    const { error } = await supabase
      .from('audiences')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw error
    return handleDatabaseSuccess(undefined)
  } catch (error) {
    return handleDatabaseError(error)
  }
}

// Helper function to generate a readable summary of audience
export function generateAudienceSummary(audience: Audience): string {
  const demo = audience.demographics
  const parts: string[] = []

  // Age and Gender
  if (demo.age_range?.min || demo.age_range?.max) {
    const ageStr = demo.age_range.min && demo.age_range.max 
      ? `aged ${demo.age_range.min} to ${demo.age_range.max}`
      : demo.age_range.min 
        ? `aged ${demo.age_range.min}+`
        : `under ${demo.age_range.max}`
    parts.push(ageStr)
  }

  if (demo.gender && demo.gender.length > 0 && !demo.gender.includes('All genders')) {
    parts.push(demo.gender.join('/').toLowerCase())
  }

  // Education/Occupation
  if (demo.education && demo.education.length > 0) {
    parts.push(demo.education.join(', ').toLowerCase())
  }

  // Location
  if (demo.location?.type) {
    parts.push(`${demo.location.type} areas`)
  }

  // Interests
  if (demo.interests && demo.interests.length > 0) {
    const interestStr = demo.interests.length > 3 
      ? `interested in ${demo.interests.slice(0, 3).join(', ')} and more`
      : `interested in ${demo.interests.join(', ')}`
    parts.push(interestStr)
  }

  return parts.join(', ')
}
