'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function RefreshButton() {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // This tells Next.js to re-fetch the server components for the current route
    router.refresh()
    
    // Simulate a slight delay so the user sees the spinner
    setTimeout(() => {
      setIsRefreshing(false)
    }, 500)
  }

  return (
    <Button 
      variant="secondary" 
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="flex items-center gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      Refresh
    </Button>
  )
}
