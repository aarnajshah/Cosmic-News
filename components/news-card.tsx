"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import type { Article } from "@/lib/types"

interface NewsCardProps {
  article: Article
}

export function NewsCard({ article }: NewsCardProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/article/${article.id}`)
  }

  return (
    <Card
      className="overflow-hidden space-border bg-card/80 backdrop-blur-sm card-hover cursor-pointer space-glow"
      onClick={handleClick}
    >
      <div className="aspect-video relative overflow-hidden">
        <Image 
          src={article.imageUrl || "/placeholder.svg"} 
          alt={article.title} 
          fill 
          className="object-cover transition-transform duration-300 hover:scale-105" 
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder.svg";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
      <CardContent className="p-4">
        <h3 className="font-bold text-lg mb-2 line-clamp-2 space-text">{article.title}</h3>
        <p className="text-muted-foreground text-sm line-clamp-2">{article.summary}</p>
      </CardContent>
      <CardFooter className="px-4 py-3 border-t border-border/50 flex justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-1 h-1 bg-purple-400 rounded-full animate-pulse"></span>
          {formatDate(article.date)}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          article.source === "NASA" 
            ? "bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm shadow-blue-500/20"
            : article.source === "National Geographic"
            ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm shadow-purple-500/20"
            : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm shadow-indigo-500/20"
        }`}>
          {article.source}
        </span>
      </CardFooter>
    </Card>
  )
}
