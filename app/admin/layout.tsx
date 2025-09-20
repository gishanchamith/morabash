import type React from "react"
import { AdminNavigation } from "@/components/admin-navigation"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <AdminNavigation />
      <div className="pt-20">{children}</div>
    </>
  )
}
