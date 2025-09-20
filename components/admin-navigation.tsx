"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Settings, Users, TrendingUp, Calendar, Target, Home, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function AdminNavigation() {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: Settings },
    { href: "/admin/score-entry", label: "Score Entry", icon: Target },
    { href: "/admin/matches", label: "Matches", icon: Calendar },
    { href: "/admin/teams", label: "Teams", icon: Users },
    { href: "/admin/standings", label: "Standings", icon: TrendingUp },
    { href: "/", label: "Public View", icon: Home },
  ]

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="glass rounded-full p-2 flex gap-1 max-w-fit">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))

          return (
            <Button
              key={item.href}
              variant={isActive ? "default" : "ghost"}
              size="sm"
              className={cn(
                "rounded-full transition-all duration-300 text-xs px-3",
                isActive && "neon-glow bg-primary text-primary-foreground",
                !isActive && "hover:bg-accent/20",
              )}
              asChild
            >
              <Link href={item.href}>
                <Icon className="h-3 w-3 mr-1" />
                {item.label}
              </Link>
            </Button>
          )
        })}
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full transition-all duration-300 text-xs px-3 hover:bg-destructive/20 hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-3 w-3 mr-1" />
          Logout
        </Button>
      </div>
    </nav>
  )
}
