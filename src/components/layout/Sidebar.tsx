'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserCheck, UserX, Inbox, Calendar, CheckSquare, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LEAD_STAFF } from '@/lib/constants'

type NavItem = {
  name: string
  href: string
  icon: typeof Inbox
  children?: { name: string, href: string }[]
}

const navigation: NavItem[] = [
  { name: 'New Leads', href: '/leads/new', icon: Inbox },
  {
    name: 'Assigned Leads',
    href: '/leads/assigned',
    icon: UserCheck,
    children: LEAD_STAFF.map(staff => ({ name: `Assigned to ${staff}`, href: `/leads/assigned/${staff.toLowerCase()}` })),
  },
  { name: 'Lost Leads', href: '/leads/lost', icon: UserX },
  { name: 'Onboarding', href: '/onboarding', icon: CheckSquare },
  { name: 'Demos', href: '/demos', icon: Calendar },
]

export function Sidebar() {
  const pathname = usePathname()
  // Dropdowns start open when you're on one of their pages
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() => Object.fromEntries(
    navigation.filter(item => item.children).map(item => [item.name, pathname.startsWith(item.href)])
  ))

  const itemClasses = (isActive: boolean) => cn(
    'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
    isActive
      ? 'bg-indigo-50 text-indigo-700'
      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
  )

  const iconClasses = (isActive: boolean) => cn(
    'h-5 w-5 shrink-0 transition-colors duration-200',
    isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'
  )

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
          const isActive = pathname === item.href || pathname.startsWith(item.href)

          if (item.children) {
            const isOpen = openMenus[item.name]
            return (
              <div key={item.name} className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => setOpenMenus(prev => ({ ...prev, [item.name]: !prev[item.name] }))}
                  className={itemClasses(isActive)}
                  aria-expanded={isOpen}
                >
                  <item.icon className={iconClasses(isActive)} aria-hidden="true" />
                  {item.name}
                  <ChevronDown className={cn('ml-auto h-4 w-4 transition-transform duration-200', isOpen && 'rotate-180')} aria-hidden="true" />
                </button>
                {isOpen && (
                  <div className="ml-5 flex flex-col gap-0.5 border-l border-gray-100 pl-3">
                    {item.children.map(child => {
                      const isChildActive = pathname === child.href
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                            isChildActive
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                          )}
                        >
                          {child.name}
                          {isChildActive && (
                            <div className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-600" />
                          )}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }

          return (
            <Link key={item.name} href={item.href} className={itemClasses(isActive)}>
              <item.icon className={iconClasses(isActive)} aria-hidden="true" />
              {item.name}
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-600" />
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
