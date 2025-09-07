"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Rocket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { newsData } from "@/lib/data"
import { formatDate } from "@/lib/utils"
import { useEffect, useState } from "react"
import type { Article } from "@/lib/types"

export default function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [articleId, setArticleId] = useState<string | null>(null)

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setArticleId(resolvedParams.id)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (!articleId) return

    const loadArticle = async () => {
      try {
        setLoading(true)
        setError(null)

        // First try to find in static newsData
        const staticArticle = newsData.find((item) => item.id === articleId)
        if (staticArticle) {
          setArticle(staticArticle)
          setLoading(false)
          return
        }

        // If not found in static data, fetch from API and find the article
        const response = await fetch('/api/nasa', { cache: 'no-store' })
        if (!response.ok) {
          throw new Error('Failed to fetch articles')
        }

        const data = await response.json()
        const scrapedArticle = data.articles?.find((item: Article) => item.id === articleId)
        
        if (scrapedArticle) {
          // Extract the original URL from the content
          const urlMatch = scrapedArticle.content.match(/https?:\/\/[^\s]+/)
          const originalUrl = urlMatch?.[0]

          if (originalUrl) {
            // Fetch the full article content
            try {
              const fullContentResponse = await fetch(`/api/article?url=${encodeURIComponent(originalUrl)}`, {
                cache: 'no-store'
              })
              
              if (fullContentResponse.ok) {
                const fullContentData = await fullContentResponse.json()
                if (fullContentData.article) {
                  const enhancedArticle = {
                    ...scrapedArticle,
                    title: fullContentData.article.title || scrapedArticle.title,
                    content: fullContentData.article.content || scrapedArticle.content,
                    imageUrl: fullContentData.article.imageUrl || scrapedArticle.imageUrl,
                    date: fullContentData.article.date || scrapedArticle.date,
                  }
                  setArticle(enhancedArticle)
                  setLoading(false)
                  return
                }
              }
            } catch (fullContentError) {
              console.log('Could not fetch full content, using summary:', fullContentError)
            }
          }

          // Fallback to enhanced summary if full content fails
          const enhancedArticle = {
            ...scrapedArticle,
            content: `${scrapedArticle.summary}

This article was originally published on ${scrapedArticle.source}. 

To read the complete article with all details, images, and full content, please visit the original source using the button below.

This is a breaking news story and may be updated as more information becomes available.`
          }
          setArticle(enhancedArticle)
        } else {
          setError('Article not found')
        }
      } catch (err) {
        console.error('Error loading article:', err)
        setError('Failed to load article')
      } finally {
        setLoading(false)
      }
    }

    loadArticle()
  }, [articleId])

  if (loading) {
    return (
      <div className="min-h-screen stars-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading article...</p>
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-screen stars-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Article not found</h1>
          <p className="text-muted-foreground mb-4">{error || "The article you're looking for doesn't exist."}</p>
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

          {/* If this is a scraped article, show link to original */}
          {article.content.includes("Read the full article at") && (
            <div className="mt-8 p-6 bg-card/50 rounded-lg border border-border/50">
              <h3 className="text-lg font-semibold mb-3">Read Full Article</h3>
              <p className="text-muted-foreground mb-4">
                This is a preview of the article. For the complete story with all details and images, visit the original source.
              </p>
              <Button 
                onClick={() => {
                  const urlMatch = article.content.match(/https?:\/\/[^\s]+/)
                  if (urlMatch) {
                    window.open(urlMatch[0], '_blank', 'noopener,noreferrer')
                  }
                }}
                className="w-full sm:w-auto"
              >
                Read Full Article on {article.source}
              </Button>
            </div>
          )}
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
