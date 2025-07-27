import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Rocket, Star, Users } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen stars-bg">
      <header className="container mx-auto py-6 px-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Rocket className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-white">AstroNews</h1>
        </div>
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="outline">Log In</Button>
          </Link>
          <Link href="/signup">
            <Button>Sign Up</Button>
          </Link>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-20 flex flex-col items-center text-center">
          <div className="space-y-6 max-w-3xl">
            <div className="flex justify-center">
              <div className="relative">
                <Star className="h-16 w-16 text-primary animate-pulse" />
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full -z-10"></div>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
              Explore the Universe with <span className="text-primary">AstroNews</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Your gateway to the latest discoveries, missions, and wonders from space. Curated content from NASA,
              Space.com, National Geographic, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-secondary/50 backdrop-blur-sm p-6 rounded-lg border border-border/50">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <Rocket className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Latest Space Missions</h3>
              <p className="text-muted-foreground">
                Stay updated with the most recent space missions from NASA, SpaceX, and other space agencies around the
                world.
              </p>
            </div>
            <div className="bg-secondary/50 backdrop-blur-sm p-6 rounded-lg border border-border/50">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Astronomical Discoveries</h3>
              <p className="text-muted-foreground">
                Explore groundbreaking discoveries about planets, stars, galaxies, and the mysteries of our universe.
              </p>
            </div>
            <div className="bg-secondary/50 backdrop-blur-sm p-6 rounded-lg border border-border/50">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Space Community</h3>
              <p className="text-muted-foreground">
                Join a community of space enthusiasts and stay informed with curated content from trusted sources.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="container mx-auto py-8 px-4 border-t border-border/50">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Rocket className="h-6 w-6 text-primary" />
            <span className="font-bold">AstroNews</span>
          </div>
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} AstroNews. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
