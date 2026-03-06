"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin } from "lucide-react"
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

export function ExperienceSection() {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [education, setEducation] = useState<Education[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const supabase = createClient()

      const [experiencesResult, educationResult] = await Promise.all([
        supabase.from("experiences").select("*").order("start_date", { ascending: false }),
        supabase.from("education").select("*").order("start_date", { ascending: false }),
      ])

      if (experiencesResult.error) throw experiencesResult.error
      if (educationResult.error) throw educationResult.error

      setExperiences(experiencesResult.data || [])
      setEducation(educationResult.data || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    })
  }

  if (loading) {
    return (
      <section id="experience" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading experience...</div>
        </div>
      </section>
    )
  }

  return (
    <section id="experience" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-balance">Experience & Education</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            My academic journey and professional development in fashion design
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Education */}
          <div className="space-y-6">
            <h3 className="font-serif text-2xl font-semibold mb-6">Education</h3>
            {education.map((edu) => (
              <Card key={edu.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-lg">{edu.degree}</h4>
                      <p className="text-primary font-medium">{edu.institution}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(edu.start_date)} - {edu.end_date ? formatDate(edu.end_date) : "Present"}
                        </div>
                        {edu.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {edu.location}
                          </div>
                        )}
                      </div>
                      {edu.grade && <p className="text-sm text-muted-foreground mt-1">Grade: {edu.grade}</p>}
                    </div>

                    <p className="text-sm leading-relaxed">{edu.description}</p>

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
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Experience */}
          <div className="space-y-6">
            <h3 className="font-serif text-2xl font-semibold mb-6">Experience</h3>
            {experiences.map((exp) => (
              <Card key={exp.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-lg">{exp.title}</h4>
                      <p className="text-primary font-medium">{exp.organization}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(exp.start_date)} - {exp.end_date ? formatDate(exp.end_date) : "Present"}
                        </div>
                        {exp.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {exp.location}
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-sm leading-relaxed">{exp.description}</p>

                    {exp.achievements.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Key Achievements:</p>
                        <ul className="text-sm space-y-1">
                          {exp.achievements.map((achievement, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-primary mt-1">•</span>
                              <span>{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
