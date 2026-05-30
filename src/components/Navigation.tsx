import { Link, useLocation } from 'react-router'
import { Brain, BarChart3, Cpu, GitBranch, BookOpen, Menu, X } from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { path: '/', label: 'Home', icon: Brain },
  { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { path: '/models', label: 'Models', icon: Cpu },
  { path: '/pipeline', label: 'Pipeline', icon: GitBranch },
  { path: '/docs', label: 'Docs', icon: BookOpen },
]

export default function Navigation() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">SentimentScope</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="rounded-lg p-2 hover:bg-muted md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="border-t border-border/60 bg-background px-4 py-3 md:hidden">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </div>
      )}
    </nav>
  )
}
