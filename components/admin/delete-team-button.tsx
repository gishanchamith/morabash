"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

type DeleteTeamButtonProps = {
  teamId: string
  teamName: string
}

export function DeleteTeamButton({ teamId, teamName }: DeleteTeamButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (isDeleting) return

    const shouldDelete = window.confirm(`Delete ${teamName}? This action cannot be undone.`)
    if (!shouldDelete) {
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/admin/teams/${teamId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const result = await response.json().catch(() => null)
        throw new Error(result?.error || "Unable to delete team")
      }
      router.refresh()
    } catch (err) {
      console.error("Failed to delete team", err)
      alert("Unable to delete the team. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-destructive hover:text-destructive"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      <Trash2 className="h-4 w-4 mr-1" />
      {isDeleting ? "Deleting..." : "Delete"}
    </Button>
  )
}
