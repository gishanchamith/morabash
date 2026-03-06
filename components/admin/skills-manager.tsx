"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit, Trash2, Save, Star } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Skill {
  id: string
  name: string
  category: string
  proficiency: number
}

export function SkillsManager() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [loading, setLoading] = useState(true)

  const categories = ["Design", "Craft", "Technical", "Communication", "Leadership"]

  const emptySkill: Omit<Skill, "id"> = {
    name: "",
    category: "",
    proficiency: 3,
  }

  useEffect(() => {
    fetchSkills()
  }, [])

  const fetchSkills = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("skills").select("*").order("category", { ascending: true })

      if (error) throw error
      setSkills(data || [])
    } catch (error) {
      console.error("Error fetching skills:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (skillData: Omit<Skill, "id"> & { id?: string }) => {
    try {
      const supabase = createClient()

      if (skillData.id) {
        const { error } = await supabase.from("skills").update(skillData).eq("id", skillData.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("skills").insert([skillData])
        if (error) throw error
      }

      await fetchSkills()
      setEditingSkill(null)
      setIsCreating(false)
    } catch (error) {
      console.error("Error saving skill:", error)
      alert("Error saving skill. Please try again.")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this skill?")) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from("skills").delete().eq("id", id)
      if (error) throw error
      await fetchSkills()
    } catch (error) {
      console.error("Error deleting skill:", error)
      alert("Error deleting skill. Please try again.")
    }
  }

  const renderStars = (proficiency: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < proficiency ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  if (loading) {
    return <div className="text-center py-8">Loading skills...</div>
  }

  const skillsByCategory = skills.reduce(
    (acc, skill) => {
      if (!acc[skill.category]) acc[skill.category] = []
      acc[skill.category].push(skill)
      return acc
    },
    {} as Record<string, Skill[]>,
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Skills ({skills.length})</h3>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating || editingSkill !== null}>
          <Plus className="h-4 w-4 mr-2" />
          Add Skill
        </Button>
      </div>

      {isCreating && (
        <SkillForm
          skill={emptySkill}
          categories={categories}
          onSave={handleSave}
          onCancel={() => setIsCreating(false)}
        />
      )}

      <div className="space-y-6">
        {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-lg">{category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {categorySkills.map((skill) => (
                  <div key={skill.id}>
                    {editingSkill?.id === skill.id ? (
                      <SkillForm
                        skill={editingSkill}
                        categories={categories}
                        onSave={handleSave}
                        onCancel={() => setEditingSkill(null)}
                      />
                    ) : (
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-1">
                          <div className="font-medium">{skill.name}</div>
                          <div className="flex items-center gap-1">{renderStars(skill.proficiency)}</div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingSkill(skill)}
                            disabled={editingSkill !== null || isCreating}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDelete(skill.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {skills.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No skills found. Click "Add Skill" to create your first skill.
        </div>
      )}
    </div>
  )
}

interface SkillFormProps {
  skill: Omit<Skill, "id"> & { id?: string }
  categories: string[]
  onSave: (skill: Omit<Skill, "id"> & { id?: string }) => void
  onCancel: () => void
}

function SkillForm({ skill, categories, onSave, onCancel }: SkillFormProps) {
  const [formData, setFormData] = useState(skill)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Skill Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="proficiency">Proficiency Level (1-5)</Label>
            <Select
              value={formData.proficiency.toString()}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, proficiency: Number.parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((level) => (
                  <SelectItem key={level} value={level.toString()}>
                    {level} Star{level !== 1 ? "s" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              Save Skill
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
