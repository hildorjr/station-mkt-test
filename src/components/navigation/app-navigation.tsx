'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Users, Lightbulb, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useSupabase } from '@/providers/supabase-provider'
import { useAuth } from '@/hooks/use-auth'

interface AppNavigationProps {
  title?: string
  showBackButton?: boolean
  customBackPath?: string
}

export default function AppNavigation({ title, showBackButton = true, customBackPath }: AppNavigationProps) {
  const router = useRouter()
  const { user } = useSupabase()
  const { signOut } = useAuth()

  if (!user) return null

  const handleBack = () => {
    if (customBackPath) {
      router.push(customBackPath)
    } else {
      router.back()
    }
  }

  return (
    <TooltipProvider>
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="flex items-center space-x-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
            )}
            

            {title && (
              <div className="hidden sm:block">
                <span className="text-gray-400">|</span>
                <span className="ml-2 font-medium text-gray-900">{title}</span>
              </div>
            )}
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/audiences')}
              className="flex items-center space-x-1"
            >
              <Users className="w-4 h-4" />
              <span>Audiences</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/concepts')}
              className="flex items-center space-x-1"
            >
              <Lightbulb className="w-4 h-4" />
              <span>Concepts</span>
            </Button>

            <div>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => signOut()}
                    className="flex items-center space-x-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side='bottom' align='end'>
                  <p>{user.email}</p>
                </TooltipContent>
              </Tooltip>
            </div>

          </div>
        </div>
      </div>
      </div>
    </TooltipProvider>
  )
}
