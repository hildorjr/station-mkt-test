import { getBrowserSupabase, handleDatabaseError, handleDatabaseSuccess, DatabaseResponse } from '@/lib/db-utils'
import { MarketingConcept, MarketingConceptFormData } from '@/types/marketing-concept'
import { Audience } from '@/types/audience'

// Client-side operations for marketing concepts

export async function getConceptsClient(userId: string): Promise<DatabaseResponse<MarketingConcept[]>> {
  try {
    const supabase = getBrowserSupabase()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('marketing_concepts')
      .select(`
        *,
        audiences(name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return handleDatabaseSuccess(data || [])
  } catch (error) {
    return handleDatabaseError(error)
  }
}

export async function getConceptsByAudienceClient(audienceId: string, userId: string): Promise<DatabaseResponse<MarketingConcept[]>> {
  try {
    const supabase = getBrowserSupabase()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('marketing_concepts')
      .select('*')
      .eq('audience_id', audienceId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return handleDatabaseSuccess(data || [])
  } catch (error) {
    return handleDatabaseError(error)
  }
}

export async function getConceptClient(id: string, userId: string): Promise<DatabaseResponse<MarketingConcept | null>> {
  try {
    const supabase = getBrowserSupabase()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('marketing_concepts')
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

export async function createConcept(formData: MarketingConceptFormData, userId: string): Promise<DatabaseResponse<MarketingConcept>> {
  try {
    const supabase = getBrowserSupabase()
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('marketing_concepts')
      .insert({
        title: formData.title,
        description: formData.description,
        audience_id: formData.audience_ids?.[0] || null, // Use first audience for backwards compatibility
        source_concept_id: formData.source_concept_id || null,
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

export async function createConceptWithSnapshots(
  formData: MarketingConceptFormData & { audience_snapshots: Audience[] }, 
  userId: string
): Promise<DatabaseResponse<MarketingConcept>> {
  try {
    const supabase = getBrowserSupabase()
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('marketing_concepts')
      .insert({
        title: formData.title,
        description: formData.description,
        audience_id: formData.audience_ids?.[0] || null, // Primary audience for reference
        audience_snapshots: formData.audience_snapshots,
        source_concept_id: formData.source_concept_id || null,
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

export async function updateConcept(id: string, formData: Partial<MarketingConceptFormData>, userId: string): Promise<DatabaseResponse<MarketingConcept>> {
  try {
    const supabase = getBrowserSupabase()
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('marketing_concepts')
      .update({
        title: formData.title,
        description: formData.description,
        audience_id: formData.audience_ids?.[0] || null,
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

export async function deleteConcept(id: string, userId: string): Promise<DatabaseResponse<void>> {
  try {
    const supabase = getBrowserSupabase()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('marketing_concepts')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw error
    return handleDatabaseSuccess(undefined)
  } catch (error) {
    return handleDatabaseError(error)
  }
}
