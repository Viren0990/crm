'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Calendar, Phone, CheckSquare, Settings, ThumbsUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Leads', href: '/leads', icon: Users },
  { name: 'Positive Leads', href: '/positive-leads', icon: ThumbsUp },
  { name: 'Follow Ups', href: '/followups', icon: Phone },
  { name: 'Onboarding', href: '/onboarding', icon: CheckSquare },
  { name: 'Demos', href: '/demos', icon: Calendar },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 shrink-0 items-center px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold">
            C
          </div>
          <span className="text-xl font-semibold text-gray-900 tracking-tight">CRM<span className="text-indigo-600">Pro</span></span>
        </div>
      </div>
      
      <div className="flex flex-1 flex-col gap-1 px-4 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 shrink-0 transition-colors duration-200',
                  isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'
                )}
                aria-hidden="true"
              />
              {item.name}
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-600" />
              )}
            </Link>
          )
        })}
      </div>

      <div className="mt-auto border-t border-gray-100 p-4 flex flex-col gap-2">
        <div className="px-3 pt-2">
          <span className="text-xs text-gray-400 font-medium">Made by - Virendra</span>
        </div>
      </div>
    </div>
  )
}
