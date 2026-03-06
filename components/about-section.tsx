import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

export function AboutSection() {
  const skills = [
    { name: "Fashion Design", category: "Design" },
    { name: "Textile Design", category: "Design" },
    { name: "Batik Art", category: "Craft" },
    { name: "Handloom Weaving", category: "Craft" },
    { name: "Product Development", category: "Design" },
    { name: "Sustainable Practices", category: "Design" },
    { name: "Cultural Heritage", category: "Research" },
    { name: "Public Speaking", category: "Communication" },
  ]

  return (
    <section id="about" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div className="relative">
            <div className="relative w-full h-[500px] rounded-2xl overflow-hidden bg-secondary">
              <Image src="/fashion-design-student-working-on-textile-project.jpg" alt="About Umasha Parami" fill className="object-cover" />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-balance">About Me</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                I am a passionate fashion design and product development student with a vision to merge tradition and
                innovation. Through my exploration of Batik and handloom weaving, I aim to contribute to sustainable
                fashion that preserves cultural identity while addressing modern design challenges.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                My academic journey and extracurricular experiences have nurtured my leadership, creativity, and
                collaborative spirit, preparing me to inspire change in the fashion industry.
              </p>
            </div>

            {/* Education Highlight */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Current Education</h3>
                <p className="text-primary font-medium">B. Design (Fashion Design & Product Development)</p>
                <p className="text-muted-foreground">University of Moratuwa • Expected 2024</p>
              </CardContent>
            </Card>

            {/* Skills */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Skills & Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge key={skill.name} variant="secondary" className="text-sm">
                    {skill.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
