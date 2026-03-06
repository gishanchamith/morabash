"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Mail, MailOpen, Calendar } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface ContactMessage {
  id: string
  name: string
  email: string
  subject?: string
  message: string
  read: boolean
  created_at: string
}

export function ContactMessagesManager() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("contact_messages").update({ read: true }).eq("id", id)

      if (error) throw error
      await fetchMessages()
    } catch (error) {
      console.error("Error marking message as read:", error)
    }
  }

  const deleteMessage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from("contact_messages").delete().eq("id", id)
      if (error) throw error
      await fetchMessages()
    } catch (error) {
      console.error("Error deleting message:", error)
      alert("Error deleting message. Please try again.")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return <div className="text-center py-8">Loading messages...</div>
  }

  const unreadCount = messages.filter((msg) => !msg.read).length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Contact Messages ({messages.length})</h3>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground">
              {unreadCount} unread message{unreadCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        {messages.map((message) => (
          <Card key={message.id} className={`${!message.read ? "border-primary/50 bg-primary/5" : ""}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{message.name}</CardTitle>
                    {!message.read && <Badge variant="default">New</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{message.email}</p>
                  {message.subject && <p className="font-medium">{message.subject}</p>}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDate(message.created_at)}
                  </div>
                </div>
                <div className="flex gap-2">
                  {!message.read && (
                    <Button size="sm" variant="outline" onClick={() => markAsRead(message.id)}>
                      <MailOpen className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      window.open(`mailto:${message.email}?subject=Re: ${message.subject || "Your message"}`)
                    }
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => deleteMessage(message.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-secondary/50 p-4 rounded-lg">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.message}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {messages.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No contact messages yet. Messages from your portfolio contact form will appear here.
        </div>
      )}
    </div>
  )
}
