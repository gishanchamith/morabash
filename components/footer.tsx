import { Linkedin, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-bold">Umasha Parami Abekoon</h3>
            <p className="text-background/80 text-sm leading-relaxed">
              Fashion Designer & Product Developer specializing in sustainable practices and cultural heritage
              preservation.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">Quick Links</h4>
            <div className="space-y-2 text-sm">
              <a href="#about" className="block text-background/80 hover:text-background transition-colors">
                About
              </a>
              <a href="#portfolio" className="block text-background/80 hover:text-background transition-colors">
                Portfolio
              </a>
              <a href="#experience" className="block text-background/80 hover:text-background transition-colors">
                Experience
              </a>
              <a href="#contact" className="block text-background/80 hover:text-background transition-colors">
                Contact
              </a>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold">Connect</h4>
            <div className="flex space-x-4">
              <a
                href="https://www.linkedin.com/in/parami-abekoon-a4982a279"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-background/10 rounded-lg hover:bg-background/20 transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="mailto:contact@umashaparami.com"
                className="p-2 bg-background/10 rounded-lg hover:bg-background/20 transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-background/20 mt-8 pt-8 text-center text-sm text-background/60">
          <p>&copy; 2024 Umasha Parami Abekoon. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
