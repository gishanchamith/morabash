"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit, Trash2, Save, X, Calendar, MapPin } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Experience {
  id: string
  title: string
  organization: string
  location: string
  start_date: string
  end_date?: string
  is_current: boolean
  description: string
  achievements: string[]
}

export function ExperienceManager() {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [loading, setLoading] = useState(true)

  const emptyExperience: Omit<Experience, "id"> = {
    title: "",
    organization: "",
    location: "",
    start_date: "",
    end_date: "",
    is_current: false,
    description: "",
    achievements: [],
  }

  useEffect(() => {
    fetchExperiences()
  }, [])

  const fetchExperiences = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("experiences").select("*").order("start_date", { ascending: false })

      if (error) throw error
      setExperiences(data || [])
    } catch (error) {
      console.error("Error fetching experiences:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (experienceData: Omit<Experience, "id"> & { id?: string }) => {
    try {
      const supabase = createClient()

      if (experienceData.id) {
        const { error } = await supabase.from("experiences").update(experienceData).eq("id", experienceData.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("experiences").insert([experienceData])
        if (error) throw error
      }

      await fetchExperiences()
      setEditingExperience(null)
      setIsCreating(false)
    } catch (error) {
      console.error("Error saving experience:", error)
      alert("Error saving experience. Please try again.")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this experience?")) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from("experiences").delete().eq("id", id)
      if (error) throw error
      await fetchExperiences()
    } catch (error) {
      console.error("Error deleting experience:", error)
      alert("Error deleting experience. Please try again.")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    })
  }

  if (loading) {
    return <div className="text-center py-8">Loading experiences...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Experience ({experiences.length})</h3>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating || editingExperience !== null}>
          <Plus className="h-4 w-4 mr-2" />
          Add Experience
        </Button>
      </div>

      {isCreating && (
        <ExperienceForm experience={emptyExperience} onSave={handleSave} onCancel={() => setIsCreating(false)} />
      )}

      <div className="grid gap-4">
        {experiences.map((experience) => (
          <Card key={experience.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{experience.title}</CardTitle>
                  <p className="text-primary font-medium">{experience.organization}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(experience.start_date)} -{" "}
                      {experience.is_current ? "Present" : experience.end_date ? formatDate(experience.end_date) : ""}
                    </div>
                    {experience.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {experience.location}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingExperience(experience)}
                    disabled={editingExperience !== null || isCreating}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(experience.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {editingExperience?.id === experience.id ? (
                <ExperienceForm
                  experience={editingExperience}
                  onSave={handleSave}
                  onCancel={() => setEditingExperience(null)}
                />
              ) : (
                <div className="space-y-3">
                  <p className="text-sm">{experience.description}</p>
                  {experience.achievements.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Key Achievements:</p>
                      <ul className="text-sm space-y-1">
                        {experience.achievements.map((achievement, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {experiences.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No experiences found. Click "Add Experience" to create your first experience entry.
        </div>
      )}
    </div>
  )
}

interface ExperienceFormProps {
  experience: Omit<Experience, "id"> & { id?: string }
  onSave: (experience: Omit<Experience, "id"> & { id?: string }) => void
  onCancel: () => void
}

function ExperienceForm({ experience, onSave, onCancel }: ExperienceFormProps) {
  const [formData, setFormData] = useState(experience)
  const [achievementInput, setAchievementInput] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const addAchievement = () => {
    if (achievementInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        achievements: [...prev.achievements, achievementInput.trim()],
      }))
      setAchievementInput("")
    }
  }

  const removeAchievement = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index),
    }))
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organization">Organization</Label>
              <Input
                id="organization"
                value={formData.organization}
                onChange={(e) => setFormData((prev) => ({ ...prev, organization: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData((prev) => ({ ...prev, start_date: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData((prev) => ({ ...prev, end_date: e.target.value }))}
                disabled={formData.is_current}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_current"
              checked={formData.is_current}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, is_current: checked, end_date: checked ? "" : prev.end_date }))
              }
            />
            <Label htmlFor="is_current">Currently working here</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Achievements</Label>
            <div className="flex gap-2">
              <Input
                value={achievementInput}
                onChange={(e) => setAchievementInput(e.target.value)}
                placeholder="Add an achievement"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addAchievement())}
              />
              <Button type="button" onClick={addAchievement}>
                Add
              </Button>
            </div>
            <div className="space-y-1">
              {formData.achievements.map((achievement, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-secondary rounded">
                  <span className="text-sm">{achievement}</span>
                  <Button type="button" size="sm" variant="ghost" onClick={() => removeAchievement(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              Save Experience
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
