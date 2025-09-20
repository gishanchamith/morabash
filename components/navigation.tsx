"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trophy, Users, TrendingUp, Home } from "lucide-react"
import { cn } from "@/lib/utils"

export function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/live-scores", label: "Live Scores", icon: Trophy },
    { href: "/teams", label: "Teams", icon: Users },
    { href: "/standings", label: "Standings", icon: TrendingUp },
  ]

  return (
    <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="glass rounded-full p-2 flex gap-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Button
              key={item.href}
              variant={isActive ? "default" : "ghost"}
              size="sm"
              className={cn(
                "rounded-full transition-all duration-300",
                isActive && "neon-glow bg-primary text-primary-foreground",
                !isActive && "hover:bg-accent/20",
              )}
              asChild
            >
              <Link href={item.href}>
                <Icon className="h-4 w-4 mr-2" />
                {item.label}
              </Link>
            </Button>
          )
        })}
      </div>
    </nav>
  )
}
