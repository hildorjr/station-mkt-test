'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSupabase } from '@/providers/supabase-provider'

export default function Home() {
  const { user, loading } = useSupabase()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
        router.push('/audiences')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Don't render the landing page if user is logged in (will redirect)
  if (user) {
    return null
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Station Marketing
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI-powered marketing concept generation tailored to your audiences
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/login">
              <Button size="lg">Sign In</Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="outline" size="lg">Get Started</Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Create Audiences</CardTitle>
              <CardDescription>
                Define your target audiences with flexible demographics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Set up detailed audience profiles with custom variables like age, location, interests, and more.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Generate Concepts</CardTitle>
              <CardDescription>
                AI-powered marketing concept creation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Use advanced AI to generate targeted marketing concepts based on your specific audience demographics.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Remix & Iterate</CardTitle>
              <CardDescription>
                Build on successful concepts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Take your best-performing concepts and remix them to create new variations and improvements.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}