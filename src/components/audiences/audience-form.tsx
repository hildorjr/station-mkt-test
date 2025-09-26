'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { X, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useSupabase } from '@/providers/supabase-provider'
import { AudienceFormData, DEMOGRAPHIC_OPTIONS } from '@/types/audience'
import { createAudience, updateAudience } from '@/lib/audiences'
import AppNavigation from '@/components/navigation/app-navigation'

const audienceSchema = z.object({
  name: z.string().min(1, 'Audience name is required').max(100, 'Name must be under 100 characters'),
  age_min: z.number().min(13).max(100).optional(),
  age_max: z.number().min(13).max(100).optional(),
  gender: z.array(z.string()),
  location_type: z.enum(['urban', 'suburban', 'rural', 'mixed']).optional(),
  regions: z.array(z.string()),
  education: z.array(z.string()),
  income_level: z.array(z.string()),
  interests: z.array(z.string()),
  hobbies: z.array(z.string()),
  brands_they_love: z.array(z.string()),
  shopping_behavior: z.array(z.string()),
  media_consumption: z.array(z.string()),
  tech_usage: z.array(z.string()),
  pain_points: z.array(z.string()),
  aspirations: z.array(z.string()),
  additional_notes: z.string().max(1000, 'Additional notes must be under 1000 characters').optional(),
}).refine((data) => {
  if (data.age_min && data.age_max) {
    return data.age_min <= data.age_max
  }
  return true
}, {
  message: "Minimum age cannot be greater than maximum age",
  path: ["age_max"],
})

interface AudienceFormProps {
  initialData?: AudienceFormData
  audienceId?: string
  mode: 'create' | 'edit'
}

export default function AudienceForm({ initialData, audienceId, mode }: AudienceFormProps) {
  const router = useRouter()
  const { user } = useSupabase()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const form = useForm<AudienceFormData>({
    resolver: zodResolver(audienceSchema),
    defaultValues: initialData || {
      name: '',
      age_min: undefined,
      age_max: undefined,
      gender: [],
      location_type: undefined,
      regions: [],
      education: [],
      income_level: [],
      interests: [],
      hobbies: [],
      brands_they_love: [],
      shopping_behavior: [],
      media_consumption: [],
      tech_usage: [],
      pain_points: [],
      aspirations: [],
      additional_notes: '',
    },
  })

  const onSubmit = async (data: AudienceFormData) => {
    if (!user) return
    
    setLoading(true)
    setError('')

    try {
      const result = mode === 'create' 
        ? await createAudience(data, user.id)
        : await updateAudience(audienceId!, data, user.id)

      if (result.success) {
        router.push('/audiences')
      } else {
        setError(result.error)
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const TagInput = ({ value, onChange, placeholder, suggestions }: {
    value: string[]
    onChange: (value: string[]) => void
    placeholder: string
    suggestions?: string[]
  }) => {
    const [input, setInput] = useState('')

    const addTag = (tag: string) => {
      if (tag && !value.includes(tag)) {
        onChange([...value, tag])
      }
      setInput('')
    }

    const removeTag = (tagToRemove: string) => {
      onChange(value.filter(tag => tag !== tagToRemove))
    }

    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addTag(input)
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => addTag(input)}
            disabled={!input}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        {suggestions && suggestions.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {suggestions.map((suggestion) => (
              <Button
                key={suggestion}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addTag(suggestion)}
                disabled={value.includes(suggestion)}
                className="text-xs h-7"
              >
                + {suggestion}
              </Button>
            ))}
          </div>
        )}

        {value.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {value.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavigation 
        title={mode === 'create' ? 'Create New Audience' : 'Edit Audience'}
        customBackPath="/audiences"
      />
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {mode === 'create' ? 'Create New Audience' : 'Edit Audience'}
            </h1>
            <p className="text-gray-600 mt-2">
              Define your target audience with detailed demographics and psychographics for better AI-generated marketing concepts.
            </p>
          </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Start with a name and basic demographic information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Audience Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., College Sports Fans" {...field} />
                      </FormControl>
                      <FormDescription>
                        Give your audience a descriptive name that captures their essence
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="age_min"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Age</FormLabel>
                        <FormControl>
                        <Input
                          type="number"
                          min="13"
                          max="100"
                          placeholder="18"
                          value={field.value?.toString() || ''}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="age_max"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Age</FormLabel>
                        <FormControl>
                        <Input
                          type="number"
                          min="13"
                          max="100"
                          placeholder="25"
                          value={field.value?.toString() || ''}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <FormControl>
                        <TagInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Add gender"
                          suggestions={DEMOGRAPHIC_OPTIONS.gender}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select location type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="urban">Urban</SelectItem>
                          <SelectItem value="suburban">Suburban</SelectItem>
                          <SelectItem value="rural">Rural</SelectItem>
                          <SelectItem value="mixed">Mixed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="regions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Regions/Countries</FormLabel>
                      <FormControl>
                        <TagInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="e.g., United States, California, New York"
                          suggestions={['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany']}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Demographics */}
            <Card>
              <CardHeader>
                <CardTitle>Demographics</CardTitle>
                <CardDescription>
                  Education and socioeconomic information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="education"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Education Level</FormLabel>
                      <FormControl>
                        <TagInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Add education level"
                          suggestions={DEMOGRAPHIC_OPTIONS.education}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="income_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Income Level</FormLabel>
                      <FormControl>
                        <TagInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Add income level"
                          suggestions={DEMOGRAPHIC_OPTIONS.income_level}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Interests & Lifestyle */}
            <Card>
              <CardHeader>
                <CardTitle>Interests & Lifestyle</CardTitle>
                <CardDescription>
                  What does this audience love and care about?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="interests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interests</FormLabel>
                      <FormControl>
                        <TagInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="e.g., college football, clash royale, baseball caps"
                          suggestions={['Sports', 'Gaming', 'Fashion', 'Technology', 'Music', 'Travel', 'Fitness']}
                        />
                      </FormControl>
                      <FormDescription>
                        What topics, activities, or areas are they passionate about?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hobbies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hobbies & Activities</FormLabel>
                      <FormControl>
                        <TagInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="e.g., playing guitar, hiking, cooking"
                          suggestions={['Reading', 'Gaming', 'Cooking', 'Photography', 'Traveling', 'Exercise']}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brands_they_love"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brands They Love</FormLabel>
                      <FormControl>
                        <TagInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="e.g., Nike, Apple, Starbucks"
                          suggestions={['Nike', 'Apple', 'Google', 'Netflix', 'Spotify', 'Amazon']}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Behavioral Data */}
            <Card>
              <CardHeader>
                <CardTitle>Behavioral Data</CardTitle>
                <CardDescription>
                  How do they behave and consume media?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="shopping_behavior"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shopping Behavior</FormLabel>
                      <FormControl>
                        <TagInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Add shopping behavior"
                          suggestions={DEMOGRAPHIC_OPTIONS.shopping_behavior}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="media_consumption"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Media Consumption</FormLabel>
                      <FormControl>
                        <TagInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Add media consumption habits"
                          suggestions={DEMOGRAPHIC_OPTIONS.media_consumption}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tech_usage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Technology Usage</FormLabel>
                      <FormControl>
                        <TagInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Add technology usage patterns"
                          suggestions={DEMOGRAPHIC_OPTIONS.tech_usage}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Psychological Profile */}
            <Card>
              <CardHeader>
                <CardTitle>Psychological Profile</CardTitle>
                <CardDescription>
                  What motivates them? What challenges do they face?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="pain_points"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pain Points & Challenges</FormLabel>
                      <FormControl>
                        <TagInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="e.g., lack of time, budget constraints, social pressure"
                          suggestions={['Time management', 'Budget constraints', 'Work-life balance', 'Social pressure']}
                        />
                      </FormControl>
                      <FormDescription>
                        What problems or frustrations does this audience regularly face?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="aspirations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goals & Aspirations</FormLabel>
                      <FormControl>
                        <TagInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="e.g., career advancement, fitness goals, travel dreams"
                          suggestions={['Career growth', 'Financial freedom', 'Health & fitness', 'Personal development']}
                        />
                      </FormControl>
                      <FormDescription>
                        What do they aspire to achieve or become?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="additional_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any additional context, insights, or specific details about this audience..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Add any other relevant information that would help create better marketing concepts
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {error && (
              <div className="text-sm text-red-600 text-center p-3 bg-red-50 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading 
                  ? mode === 'create' 
                    ? 'Creating...' 
                    : 'Updating...'
                  : mode === 'create' 
                    ? 'Create Audience' 
                    : 'Update Audience'
                }
              </Button>
            </div>
          </form>
        </Form>
        </div>
      </div>
    </div>
  )
}
