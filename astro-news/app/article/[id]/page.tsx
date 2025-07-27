"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Rocket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { newsData } from "@/lib/data"
import { formatDate } from "@/lib/utils"

export default function ArticlePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const article = newsData.find((item) => item.id === params.id)

  if (!article) {
    return (
      <div className="min-h-screen stars-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Article not found</h1>
          <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen stars-bg">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Rocket className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">AstroNews</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to News
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <article className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{article.title}</h1>
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-6">
              <span>Source: {article.source}</span>
              <span>{formatDate(article.date)}</span>
            </div>
          </div>

          <div className="relative aspect-video mb-8">
            <Image
              src={article.imageUrl || "/placeholder.svg"}
              alt={article.title}
              fill
              className="object-cover rounded-lg"
              priority
            />
          </div>

          <div className="prose prose-invert max-w-none">
            {article.content.split("\n\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </article>
      </main>

      <footer className="container mx-auto py-8 px-4 border-t border-border/50">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Rocket className="h-5 w-5 text-primary" />
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
