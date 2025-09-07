import { NextResponse } from "next/server"
import * as cheerio from "cheerio"
import type { Article } from "@/lib/types"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const articleUrl = searchParams.get("url")
    
    if (!articleUrl) {
      return NextResponse.json({ error: "Article URL is required" }, { status: 400 })
    }

    console.log(`Fetching full article content from: ${articleUrl}`)

    const headers = {
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "accept-language": "en-US,en;q=0.5",
      "accept-encoding": "gzip, deflate, br",
      referer: "https://www.space.com/",
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "same-origin",
      "upgrade-insecure-requests": "1",
    }

    const response = await fetch(articleUrl, {
      headers,
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch article: ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Extract article content from various possible selectors
    let title = ""
    let content = ""
    let imageUrl = ""
    let publishDate = ""

    // Try to extract title
    const titleSelectors = [
      'h1.article-name',
      'h1[data-testid="ArticleName"]',
      '.article-header h1',
      'header h1',
      'h1',
    ]

    for (const selector of titleSelectors) {
      const titleEl = $(selector).first()
      if (titleEl.length > 0) {
        title = titleEl.text().trim()
        if (title && title.length > 10) break
      }
    }

    // Try to extract main content
    const contentSelectors = [
      '.article-body',
      '.content-body',
      '[data-testid="BodyText"]',
      '.article-content',
      '.entry-content',
      'article .text-copy',
      '.vanilla-body',
    ]

    for (const selector of contentSelectors) {
      const contentEl = $(selector).first()
      if (contentEl.length > 0) {
        // Remove ads, related articles, and other non-content elements
        contentEl.find('script, .ad, .advertisement, .related, .social, .newsletter, .comments').remove()
        
        // Extract text content with paragraph breaks
        const paragraphs: string[] = []
        contentEl.find('p, h2, h3, h4').each((_, el) => {
          const text = $(el).text().trim()
          if (text && text.length > 20) {
            paragraphs.push(text)
          }
        })
        
        if (paragraphs.length > 0) {
          content = paragraphs.join('\n\n')
          break
        }
      }
    }

    // Try to extract main article image
    const imageSelectors = [
      '.article-lead-image img',
      '.hero-image img',
      'figure.article-lead-image-wrap img',
      '.main-image img',
      'article img',
    ]

    for (const selector of imageSelectors) {
      const imgEl = $(selector).first()
      if (imgEl.length > 0) {
        let imgSrc = imgEl.attr('data-original') || 
                    imgEl.attr('data-src') || 
                    imgEl.attr('src')
        
        if (imgSrc) {
          if (imgSrc.startsWith('//')) {
            imgSrc = `https:${imgSrc}`
          } else if (imgSrc.startsWith('/')) {
            imgSrc = `https://www.space.com${imgSrc}`
          }
          
          if (imgSrc.includes('space.com') || imgSrc.includes('futurecdn.net')) {
            imageUrl = imgSrc
            break
          }
        }
      }
    }

    // Try to extract publish date
    const dateSelectors = [
      'time[datetime]',
      '.publish-date',
      '.article-date',
      '[data-testid="PublishDate"]',
    ]

    for (const selector of dateSelectors) {
      const dateEl = $(selector).first()
      if (dateEl.length > 0) {
        publishDate = dateEl.attr('datetime') || dateEl.text().trim()
        if (publishDate) break
      }
    }

    // If we couldn't extract enough content, return an error
    if (!title && !content) {
      throw new Error("Could not extract article content")
    }

    const fullArticle = {
      title: title || "Article Title",
      content: content || "Article content could not be extracted. Please visit the original source.",
      imageUrl: imageUrl || "/placeholder.svg",
      date: publishDate || new Date().toISOString(),
    }

    console.log(`Successfully extracted article: ${title?.slice(0, 50)}...`)
    return NextResponse.json({ article: fullArticle })

  } catch (error: unknown) {
    console.error("Article extraction error:", error)
    return NextResponse.json(
      { error: (error as Error).message ?? "Failed to extract article content." },
      { status: 500 }
    )
  }
}
