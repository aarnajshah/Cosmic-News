"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Rocket, Search, LogOut, Menu, X, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NewsCard } from "@/components/news-card"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { newsData } from "@/lib/data"
import type { Article } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"

export default function DashboardPage() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [articles, setArticles] = useState<Article[]>(newsData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiInfo, setApiInfo] = useState<{
    cached?: boolean
    filtered?: { total: number; recent: number; returned: number }
    sources?: { nasa: number; natgeo: number; space: number }
  } | null>(null)

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
          setApiInfo({
            cached: data.cached,
            filtered: data.filtered,
            sources: data.sources
          })
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

  const handleLogout = async () => {
    await signOut()
    router.push("/")
  }

  return (
    <div className="min-h-screen stars-bg">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50 space-border">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Rocket className="h-6 w-6 text-primary" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            </div>
            <h1 className="text-xl font-bold space-text">AstroNews</h1>
          </div>

          <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search articles..."
                className="w-full pl-9 space-border bg-background/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{user.email}</span>
              </div>
            )}
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
                  {user && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground px-2 py-1">
                      <User className="h-4 w-4" />
                      <span>{user.email}</span>
                    </div>
                  )}
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
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 space-text">Latest Space News</h1>
          <p className="text-muted-foreground text-lg">Discover the latest articles from NASA, National Geographic, and Space.com</p>
          <div className="flex justify-center mt-4">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
              <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
            </div>
          </div>
        </div>

        {/* API Status Information */}
        {apiInfo && (
          <div className="space-border bg-secondary/50 backdrop-blur-sm p-4 rounded-lg mb-6 space-glow">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${apiInfo.cached ? 'bg-green-400 animate-pulse' : 'bg-blue-400 animate-pulse'}`}></div>
                <span className="text-muted-foreground">
                  {apiInfo.cached ? 'Cached data' : 'Live data'}
                </span>
              </div>
              {apiInfo.filtered && (
                <div className="text-muted-foreground">
                  Showing {apiInfo.filtered.returned} of {apiInfo.filtered.recent} recent articles (from {apiInfo.filtered.total} total)
                </div>
              )}
              {apiInfo.sources && (
                <div className="text-muted-foreground">
                  Sources: {apiInfo.sources.nasa} NASA, {apiInfo.sources.natgeo} NatGeo, {apiInfo.sources.space} Space.com
                </div>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <div className="w-3 h-3 bg-violet-400 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
              </div>
            </div>
            <p className="text-muted-foreground space-text">Loading articles from the cosmos...</p>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🌌</div>
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
