'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Users, Lightbulb, LogOut, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useSupabase } from '@/providers/supabase-provider'
import { useAuth } from '@/hooks/use-auth'
import { handleDatabaseError } from '@/lib/db-utils'

interface AppNavigationProps {
  title?: string
  showBackButton?: boolean
  customBackPath?: string
}

export default function AppNavigation({ title, showBackButton = true, customBackPath }: AppNavigationProps) {
  const router = useRouter()
  const { user } = useSupabase()
  const { signOut } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  if (!user) return null

  const handleBack = () => {
    if (customBackPath) {
      router.push(customBackPath)
    } else {
      router.back()
    }
  }

  const handleNavigation = (path: string) => {
    router.push(path)
    setIsMobileMenuOpen(false)
  }

  const handleSignOut = async () => {
    await signOut()
    setIsMobileMenuOpen(false)
    router.push('/auth/login')
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
                  <span className="hidden sm:inline">Back</span>
                </Button>
              )}
              
              {title && (
                <div className="hidden sm:block">
                  <span className="text-gray-400">|</span>
                  <span className="ml-2 font-medium text-gray-900">{title}</span>
                </div>
              )}
            </div>

            {/* Desktop Navigation */}
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
                      onClick={handleSignOut}
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

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex items-center space-x-1"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 bg-white">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigation('/audiences')}
                  className="w-full justify-start flex items-center space-x-2"
                >
                  <Users className="w-4 h-4" />
                  <span>Audiences</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigation('/concepts')}
                  className="w-full justify-start flex items-center space-x-2"
                >
                  <Lightbulb className="w-4 h-4" />
                  <span>Concepts</span>
                </Button>

                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="px-2 text-xs text-gray-500 mb-1">
                    {user.email}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="w-full justify-start flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
