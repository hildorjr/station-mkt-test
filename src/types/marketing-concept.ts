import { Audience } from './audience'

export interface MarketingConcept {
  id: string
  user_id: string
  audience_id?: string | null
  title: string
  description: string
  source_concept_id?: string | null
  audience_snapshots: Audience[]
  created_at: string
  updated_at: string
}

export interface MarketingConceptFormData {
  title: string
  description: string
  audience_ids: string[]
  source_concept_id?: string
}
