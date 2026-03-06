"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Save, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { ImageUpload } from "./image-upload"

interface Project {
  id: string
  title: string
  description: string
  long_description: string
  category: string
  tags: string[]
  image_url: string
  gallery_images: string[]
  project_url?: string
  github_url?: string
  featured: boolean
  order_index: number
}

export function ProjectsManager() {
  const [projects, setProjects] = useState<Project[]>([])
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [loading, setLoading] = useState(true)

  const categories = ["Textile Art", "Sustainable Design", "Product Development", "Fashion Design"]

  const emptyProject: Omit<Project, "id"> = {
    title: "",
    description: "",
    long_description: "",
    category: "",
    tags: [],
    image_url: "",
    gallery_images: [],
    project_url: "",
    github_url: "",
    featured: false,
    order_index: 0,
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("projects").select("*").order("order_index", { ascending: true })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error("Error fetching projects:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (projectData: Omit<Project, "id"> & { id?: string }) => {
    try {
      const supabase = createClient()

      if (projectData.id) {
        // Update existing project
        const { error } = await supabase.from("projects").update(projectData).eq("id", projectData.id)
        if (error) throw error
      } else {
        // Create new project
        const { error } = await supabase.from("projects").insert([projectData])
        if (error) throw error
      }

      await fetchProjects()
      setEditingProject(null)
      setIsCreating(false)
    } catch (error) {
      console.error("Error saving project:", error)
      alert("Error saving project. Please try again.")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from("projects").delete().eq("id", id)
      if (error) throw error
      await fetchProjects()
    } catch (error) {
      console.error("Error deleting project:", error)
      alert("Error deleting project. Please try again.")
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading projects...</div>
  }

  return (
    <div className="space-y-6">
      {/* Add New Project Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Projects ({projects.length})</h3>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating || editingProject !== null}>
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </div>

      {/* Create New Project Form */}
      {isCreating && (
        <ProjectForm
          project={emptyProject}
          categories={categories}
          onSave={handleSave}
          onCancel={() => setIsCreating(false)}
        />
      )}

      {/* Projects List */}
      <div className="grid gap-4">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{project.category}</Badge>
                    {project.featured && <Badge variant="default">Featured</Badge>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingProject(project)}
                    disabled={editingProject !== null || isCreating}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(project.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {editingProject?.id === project.id ? (
                <ProjectForm
                  project={editingProject}
                  categories={categories}
                  onSave={handleSave}
                  onCancel={() => setEditingProject(null)}
                />
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No projects found. Click "Add Project" to create your first project.
        </div>
      )}
    </div>
  )
}

interface ProjectFormProps {
  project: Omit<Project, "id"> & { id?: string }
  categories: string[]
  onSave: (project: Omit<Project, "id"> & { id?: string }) => void
  onCancel: () => void
}

function ProjectForm({ project, categories, onSave, onCancel }: ProjectFormProps) {
  const [formData, setFormData] = useState(project)
  const [tagInput, setTagInput] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }))
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
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
            <Label htmlFor="description">Short Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={2}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="long_description">Long Description</Label>
            <Textarea
              id="long_description"
              value={formData.long_description}
              onChange={(e) => setFormData((prev) => ({ ...prev, long_description: e.target.value }))}
              rows={4}
            />
          </div>

          <ImageUpload
            value={formData.image_url}
            onChange={(url) => setFormData((prev) => ({ ...prev, image_url: url }))}
            label="Project Image"
            placeholder="Enter image URL or upload a file"
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="order_index">Order Index</Label>
              <Input
                id="order_index"
                type="number"
                value={formData.order_index}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, order_index: Number.parseInt(e.target.value) || 0 }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project_url">Project URL (optional)</Label>
              <Input
                id="project_url"
                value={formData.project_url}
                onChange={(e) => setFormData((prev) => ({ ...prev, project_url: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="github_url">GitHub URL (optional)</Label>
            <Input
              id="github_url"
              value={formData.github_url}
              onChange={(e) => setFormData((prev) => ({ ...prev, github_url: e.target.value }))}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                  {tag} <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, featured: checked }))}
            />
            <Label htmlFor="featured">Featured Project</Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              Save Project
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
