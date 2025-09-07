"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Rocket, Search, LogOut, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NewsCard } from "@/components/news-card"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { newsData } from "@/lib/data"
import type { Article } from "@/lib/types"

export default function DashboardPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [articles, setArticles] = useState<Article[]>(newsData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCancelled = false
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch("/api/nasa", { cache: "no-store" })
        if (!res.ok) throw new Error(`Failed to load NASA articles (${res.status})`)
        const data = await res.json()
        if (!isCancelled && Array.isArray(data?.articles) && data.articles.length > 0) {
          setArticles(data.articles)
        }
      } catch (e) {
        if (!isCancelled) {
          setError((e as Error).message)
          setArticles(newsData)
        }
      } finally {
        if (!isCancelled) setLoading(false)
      }
    }
    load()
    return () => {
      isCancelled = true
    }
  }, [])

  const filteredNews = useMemo(() => {
    const source = articles
    if (!searchQuery) return source
    const q = searchQuery.toLowerCase()
    return source.filter((item) => item.title.toLowerCase().includes(q) || item.summary.toLowerCase().includes(q))
  }, [articles, searchQuery])

  const handleLogout = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen stars-bg">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Rocket className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">AstroNews</h1>
          </div>

          <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search articles..."
                className="w-full pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Log out
            </Button>
          </div>

          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between pb-4 border-b">
                  <div className="flex items-center gap-2">
                    <Rocket className="h-5 w-5 text-primary" />
                    <span className="font-semibold">AstroNews</span>
                  </div>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <X className="h-4 w-4" />
                      <span className="sr-only">Close menu</span>
                    </Button>
                  </SheetTrigger>
                </div>

                <div className="py-4 border-b">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search articles..."
                      className="w-full pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <Button variant="ghost" className="justify-start" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Log out
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="md:hidden container mx-auto px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search articles..."
              className="w-full pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Latest Space News</h1>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading articles...</p>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {error ? `Error loading NASA articles. Showing defaults.` : "No articles found matching your search."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        )}
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
