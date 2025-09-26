import { Database } from './database'
import { Audience } from './audience'

// Use Supabase-generated types
export type MarketingConcept = Database['public']['Tables']['marketing_concepts']['Row'] & {
  // Override audience_snapshots with proper typing
  audience_snapshots: Audience[]
}
export type MarketingConceptInsert = Database['public']['Tables']['marketing_concepts']['Insert']
export type MarketingConceptUpdate = Database['public']['Tables']['marketing_concepts']['Update']

export interface MarketingConceptFormData {
  title: string
  description: string
  audience_ids: string[]
  source_concept_id?: string
}
