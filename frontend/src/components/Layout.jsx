import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import {
  LayoutDashboard, FolderGit2, MessageSquareCode,
  BarChart3, LogOut, Bot, User, Menu, X
} from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { to: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/repositories', label: 'Repositories', icon: FolderGit2 },
  { to: '/chat',         label: 'AI Chat',       icon: MessageSquareCode },
  { to: '/analytics',   label: 'Analytics',     icon: BarChart3 },
]

export default function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Route change hone pe mobile sidebar band ho jaye
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  // Body scroll band karo jab sidebar khula ho mobile pe
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-600 rounded-lg">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm">APex-Ai</p>
            <p className="text-xs text-gray-500">Code Analysis Agent</p>
          </div>
        </div>
        {/* Mobile close button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
              isActive
                ? 'bg-brand-600/20 text-brand-400 border border-brand-600/30'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-800/50 mb-2">
          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-200 truncate">{user?.displayName}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-900/20 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex w-64 bg-gray-900 border-r border-gray-800 flex-col flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* ── Mobile Overlay (background dark) ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          style={{ backdropFilter: 'blur(2px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Mobile Sidebar (slide in from left) ── */}
      <aside
        className="fixed top-0 left-0 h-full w-72 bg-gray-900 border-r border-gray-800 z-50 flex flex-col lg:hidden transition-transform duration-300 ease-in-out"
        style={{ transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)' }}
      >
        <SidebarContent />
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── Mobile Top Navbar ── */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-brand-600 rounded-lg">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-sm">APex-Ai</span>
          </div>

          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        </header>

        {/* ── Page Content ── */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}