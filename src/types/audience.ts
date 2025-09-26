import { Database } from './database'

// Use Supabase-generated types
export type Audience = Database['public']['Tables']['audiences']['Row']
export type AudienceInsert = Database['public']['Tables']['audiences']['Insert']
export type AudienceUpdate = Database['public']['Tables']['audiences']['Update']

// Keep the demographics interface for form handling and type safety
export interface AudienceDemographics {
  // Basic Demographics
  age_range?: {
    min?: number
    max?: number
  }
  gender?: string[]
  location?: {
    type?: 'urban' | 'suburban' | 'rural' | 'mixed'
    regions?: string[]
    countries?: string[]
  }
  education?: string[]
  income_level?: string[]
  
  // Lifestyle & Interests  
  interests?: string[]
  hobbies?: string[]
  brands_they_love?: string[]
  
  // Behavioral Data
  shopping_behavior?: string[]
  media_consumption?: string[]
  tech_usage?: string[]
  
  // Additional Context
  pain_points?: string[]
  aspirations?: string[]
  additional_notes?: string
}

export interface AudienceFormData {
  name: string
  age_min?: number
  age_max?: number
  gender: string[]
  location_type?: 'urban' | 'suburban' | 'rural' | 'mixed'
  regions: string[]
  education: string[]
  income_level: string[]
  interests: string[]
  hobbies: string[]
  brands_they_love: string[]
  shopping_behavior: string[]
  media_consumption: string[]
  tech_usage: string[]
  pain_points: string[]
  aspirations: string[]
  additional_notes?: string
}

// Predefined options for dropdowns
export const DEMOGRAPHIC_OPTIONS = {
  gender: ['Male', 'Female', 'Non-binary', 'All genders'],
  education: ['High School', 'College Student', 'Bachelor\'s Degree', 'Master\'s Degree', 'PhD', 'Trade School', 'Self-taught'],
  income_level: ['Low income', 'Lower-middle class', 'Middle class', 'Upper-middle class', 'High income'],
  shopping_behavior: ['Online shopper', 'In-store shopper', 'Bargain hunter', 'Brand loyal', 'Impulse buyer', 'Research-focused', 'Early adopter'],
  media_consumption: ['Social media heavy', 'TV watcher', 'Podcast listener', 'Newsletter reader', 'YouTube viewer', 'Streaming services', 'Gaming'],
  tech_usage: ['Smartphone power user', 'Desktop user', 'Early tech adopter', 'Basic tech user', 'Smart home user', 'Wearables user']
}
