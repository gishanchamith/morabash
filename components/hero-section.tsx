import { Button } from "@/components/ui/button"
import { ArrowDown, Mail, Linkedin } from "lucide-react"
import Image from "next/image"

export function HeroSection() {
  return (
    <section className="min-h-screen flex items-center justify-center hero-gradient pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="space-y-4">
              <p className="text-primary font-medium tracking-wide uppercase text-sm">
                Fashion Designer & Product Developer
              </p>
              <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-balance leading-tight">
                Umasha Parami
                <span className="block text-primary">Abekoon</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl text-pretty leading-relaxed">
                Passionate about merging tradition and innovation through sustainable fashion design, cultural heritage
                preservation, and creative textile solutions.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90" asChild>
                <a href="#contact">
                  <Mail className="mr-2 h-4 w-4" />
                  Get In Touch
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="#portfolio">
                  View Portfolio
                  <ArrowDown className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4 pt-4">
              <a
                href="https://www.linkedin.com/in/parami-abekoon-a4982a279"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-secondary hover:bg-accent transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="mailto:contact@umashaparami.com"
                className="p-2 rounded-full bg-secondary hover:bg-accent transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative w-full h-[600px] rounded-2xl overflow-hidden bg-secondary">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-sunjPGmUfSilHglhjrh1s5RZ6iRAsD.png"
                alt="Umasha Parami Abekoon"
                fill
                className="object-cover"
                priority
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-accent/30 rounded-full blur-xl"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
