import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { X } from 'lucide-react'
import StudentSidebar from './StudentSidebar'
import Navbar from './Navbar'
import MobileNav from './MobileNav'

export default function StudentLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-sand-50">
      <aside className="hidden lg:block">
        <div className="fixed inset-y-0 left-0 z-20">
          <StudentSidebar />
        </div>
      </aside>

      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-brand-950/50" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 animate-[modal-in_0.15s_ease-out]">
            <StudentSidebar onNavigate={() => setDrawerOpen(false)} />
            <button
              onClick={() => setDrawerOpen(false)}
              className="absolute right-3 top-4 rounded-lg p-1.5 text-brand-100 hover:bg-brand-600"
              aria-label="Close menu"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        <Navbar onOpenMobileNav={() => setDrawerOpen(true)} />
        <main className="flex-1 px-4 pb-20 pt-6 sm:px-6 lg:px-8 lg:pb-8">
          <Outlet />
        </main>
        <MobileNav onMore={() => setDrawerOpen(true)} />
      </div>
    </div>
  )
}
