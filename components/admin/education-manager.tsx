"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Save, X, Calendar, MapPin } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Education {
  id: string
  degree: string
  institution: string
  location: string
  start_date: string
  end_date?: string
  is_current: boolean
  grade?: string
  description: string
  activities: string[]
}

export function EducationManager() {
  const [education, setEducation] = useState<Education[]>([])
  const [editingEducation, setEditingEducation] = useState<Education | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [loading, setLoading] = useState(true)

  const emptyEducation: Omit<Education, "id"> = {
    degree: "",
    institution: "",
    location: "",
    start_date: "",
    end_date: "",
    is_current: false,
    grade: "",
    description: "",
    activities: [],
  }

  useEffect(() => {
    fetchEducation()
  }, [])

  const fetchEducation = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("education").select("*").order("start_date", { ascending: false })

      if (error) throw error
      setEducation(data || [])
    } catch (error) {
      console.error("Error fetching education:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (educationData: Omit<Education, "id"> & { id?: string }) => {
    try {
      const supabase = createClient()

      if (educationData.id) {
        const { error } = await supabase.from("education").update(educationData).eq("id", educationData.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("education").insert([educationData])
        if (error) throw error
      }

      await fetchEducation()
      setEditingEducation(null)
      setIsCreating(false)
    } catch (error) {
      console.error("Error saving education:", error)
      alert("Error saving education. Please try again.")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this education entry?")) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from("education").delete().eq("id", id)
      if (error) throw error
      await fetchEducation()
    } catch (error) {
      console.error("Error deleting education:", error)
      alert("Error deleting education. Please try again.")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    })
  }

  if (loading) {
    return <div className="text-center py-8">Loading education...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Education ({education.length})</h3>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating || editingEducation !== null}>
          <Plus className="h-4 w-4 mr-2" />
          Add Education
        </Button>
      </div>

      {isCreating && (
        <EducationForm education={emptyEducation} onSave={handleSave} onCancel={() => setIsCreating(false)} />
      )}

      <div className="grid gap-4">
        {education.map((edu) => (
          <Card key={edu.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{edu.degree}</CardTitle>
                  <p className="text-primary font-medium">{edu.institution}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(edu.start_date)} -{" "}
                      {edu.is_current ? "Present" : edu.end_date ? formatDate(edu.end_date) : ""}
                    </div>
                    {edu.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {edu.location}
                      </div>
                    )}
                  </div>
                  {edu.grade && <p className="text-sm text-muted-foreground">Grade: {edu.grade}</p>}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingEducation(edu)}
                    disabled={editingEducation !== null || isCreating}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(edu.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {editingEducation?.id === edu.id ? (
                <EducationForm
                  education={editingEducation}
                  onSave={handleSave}
                  onCancel={() => setEditingEducation(null)}
                />
              ) : (
                <div className="space-y-3">
                  <p className="text-sm">{edu.description}</p>
                  {edu.activities.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Activities & Societies:</p>
                      <div className="flex flex-wrap gap-1">
                        {edu.activities.map((activity, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {activity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {education.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No education entries found. Click "Add Education" to create your first education entry.
        </div>
      )}
    </div>
  )
}

interface EducationFormProps {
  education: Omit<Education, "id"> & { id?: string }
  onSave: (education: Omit<Education, "id"> & { id?: string }) => void
  onCancel: () => void
}

function EducationForm({ education, onSave, onCancel }: EducationFormProps) {
  const [formData, setFormData] = useState(education)
  const [activityInput, setActivityInput] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const addActivity = () => {
    if (activityInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        activities: [...prev.activities, activityInput.trim()],
      }))
      setActivityInput("")
    }
  }

  const removeActivity = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== index),
    }))
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="degree">Degree/Qualification</Label>
              <Input
                id="degree"
                value={formData.degree}
                onChange={(e) => setFormData((prev) => ({ ...prev, degree: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="institution">Institution</Label>
              <Input
                id="institution"
                value={formData.institution}
                onChange={(e) => setFormData((prev) => ({ ...prev, institution: e.target.value }))}
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
            <Label htmlFor="is_current">Currently studying here</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade">Grade/GPA (optional)</Label>
            <Input
              id="grade"
              value={formData.grade}
              onChange={(e) => setFormData((prev) => ({ ...prev, grade: e.target.value }))}
              placeholder="e.g., 3.8 GPA, First Class Honours"
            />
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
            <Label>Activities & Societies</Label>
            <div className="flex gap-2">
              <Input
                value={activityInput}
                onChange={(e) => setActivityInput(e.target.value)}
                placeholder="Add an activity or society"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addActivity())}
              />
              <Button type="button" onClick={addActivity}>
                Add
              </Button>
            </div>
            <div className="space-y-1">
              {formData.activities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-secondary rounded">
                  <span className="text-sm">{activity}</span>
                  <Button type="button" size="sm" variant="ghost" onClick={() => removeActivity(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              Save Education
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
