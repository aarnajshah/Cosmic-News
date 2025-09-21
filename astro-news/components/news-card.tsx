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
      className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm card-hover cursor-pointer"
      onClick={handleClick}
    >
      <div className="aspect-video relative">
        <Image src={article.imageUrl || "/placeholder.svg"} alt={article.title} fill className="object-cover" />
      </div>
      <CardContent className="p-4">
        <h3 className="font-bold text-lg mb-2 line-clamp-2">{article.title}</h3>
        <p className="text-muted-foreground text-sm line-clamp-2">{article.summary}</p>
      </CardContent>
      <CardFooter className="px-4 py-3 border-t border-border/50 flex justify-between text-xs text-muted-foreground">
        <span>{formatDate(article.date)}</span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          article.source === "NASA" 
            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            : article.source === "National Geographic"
            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
            : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
        }`}>
          {article.source}
        </span>
      </CardFooter>
    </Card>
  )
}
