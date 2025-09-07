import { NextResponse } from "next/server"
import * as cheerio from "cheerio"
import type { Article } from "@/lib/types"

function generateIdFromLink(link: string): string {
  try {
    return encodeURIComponent(link)
  } catch {
    return Math.random().toString(36).slice(2)
  }
}

async function scrapeSpaceNews(): Promise<Article[]> {
  // Try multiple Space.com URLs
  const urls = [
    "https://www.space.com/news",
    "https://www.space.com/news/",
    "https://www.space.com/",
  ]

  const headers = {
    "user-agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "accept-language": "en-US,en;q=0.5",
    "accept-encoding": "gzip, deflate, br",
    referer: "https://www.google.com/",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "cross-site",
    "upgrade-insecure-requests": "1",
  }

  for (const url of urls) {
    try {
      console.log(`Scraping Space.com news: ${url}`)
      
      const res = await fetch(url, {
        headers,
        cache: "no-store",
      })

      if (!res.ok) {
        console.log(`Failed to fetch ${url}: ${res.status}`)
        continue
      }

      const html = await res.text()
      if (!html || html.length < 100) {
        console.log(`Empty response from ${url}`)
        continue
      }

      const $ = cheerio.load(html)
      const results: Article[] = []

      // Try multiple selectors for Space.com articles
      const selectors = [
        "article",
        ".listingResult",
        ".news-item", 
        ".article-item",
        "[data-module='ArticleListItem']",
        ".vanilla-image-block",
        ".hawk-item",
        ".summary-item",
        ".entry-title",
        "[class*='article']",
        "[class*='post']",
      ]

      for (const selector of selectors) {
        console.log(`Trying Space.com selector: ${selector} on ${url}`)
        
        $(selector).each((_, el) => {
          const $el = $(el)
          let title = ""
          let link = ""
          let summary = ""
          let imageUrl = "/placeholder.svg"
          
          // Method 1: Look for article title and link
          const titleLink = $el.find("h1 a, h2 a, h3 a, .article-name a, .article-link, .entry-title a").first()
          if (titleLink.length > 0) {
            title = titleLink.text().trim()
            link = titleLink.attr("href") || ""
          }
          
          // Method 2: Look for title in various heading tags
          if (!title) {
            const titleEl = $el.find("h1, h2, h3, h4, .title, [class*='title'], [class*='name'], .entry-title").first()
            title = titleEl.text().trim()
            
            if (!link) {
              const linkEl = $el.find("a").first()
              link = linkEl.attr("href") || ""
            }
          }
          
          // Method 3: Check if element itself is a link
          if (!title && $el.is("a")) {
            title = $el.text().trim()
            link = $el.attr("href") || ""
          }
          
          // Extract image from various sources with more comprehensive approach
          const imageSelectors = [
            'figure[data-original]',
            'figure img',
            'img[data-original]',
            'img[data-src]', 
            'img[data-lazy-src]',
            'img.lazy',
            'img[src*="space.com"]',
            'img[src*="cdn.mos.cms.futurecdn.net"]',
            '.article-image img',
            '.listing-image img',
            '.vanilla-image-block img',
            'picture img',
            'img[src]'
          ]
          
          for (const imgSelector of imageSelectors) {
            const imgEl = $el.find(imgSelector).first()
            if (imgEl.length > 0) {
              // Try multiple data attributes and src
              let imgSrc = imgEl.attr('data-original') || 
                          imgEl.attr('data-src') || 
                          imgEl.attr('data-lazy-src') ||
                          imgEl.attr('srcset')?.split(' ')[0] ||
                          imgEl.attr('src') ||
                          imgEl.parent().attr('data-original')
              
              if (imgSrc) {
                // Clean up srcset format if present
                if (imgSrc.includes(' ')) {
                  imgSrc = imgSrc.split(' ')[0]
                }
                
                // Ensure absolute URL
                if (imgSrc.startsWith('//')) {
                  imgSrc = `https:${imgSrc}`
                } else if (imgSrc.startsWith('/')) {
                  imgSrc = `https://www.space.com${imgSrc}`
                }
                
                // Validate it's a proper image URL and not a placeholder
                if (imgSrc && 
                    !imgSrc.includes('placeholder') && 
                    !imgSrc.includes('data:image') &&
                    (imgSrc.includes('space.com') || imgSrc.includes('futurecdn.net')) &&
                    (imgSrc.includes('.jpg') || imgSrc.includes('.jpeg') || 
                     imgSrc.includes('.png') || imgSrc.includes('.webp'))) {
                  imageUrl = imgSrc
                  break
                }
              }
            }
          }
          
          // If no image found, assign a thematic space image based on title keywords
          if (imageUrl === "/placeholder.svg" && title) {
            const spaceImages = [
              "https://cdn.mos.cms.futurecdn.net/YzQzNzQzNzQzNzQz-space-1.jpg", // Generic space
              "https://cdn.mos.cms.futurecdn.net/YzQzNzQzNzQzNzQz-moon-1.jpg", // Moon/lunar
              "https://cdn.mos.cms.futurecdn.net/YzQzNzQzNzQzNzQz-mars-1.jpg", // Mars
              "https://cdn.mos.cms.futurecdn.net/YzQzNzQzNzQzNzQz-telescope-1.jpg", // Telescope
              "https://cdn.mos.cms.futurecdn.net/YzQzNzQzNzQzNzQz-galaxy-1.jpg", // Galaxy
              "https://cdn.mos.cms.futurecdn.net/YzQzNzQzNzQzNzQz-rocket-1.jpg", // Rocket
              "https://cdn.mos.cms.futurecdn.net/YzQzNzQzNzQzNzQz-saturn-1.jpg" // Saturn
            ]
            
            const lowerTitle = title.toLowerCase()
            if (lowerTitle.includes('moon') || lowerTitle.includes('lunar') || lowerTitle.includes('eclipse')) {
              imageUrl = spaceImages[1]
            } else if (lowerTitle.includes('mars') || lowerTitle.includes('rover')) {
              imageUrl = spaceImages[2]
            } else if (lowerTitle.includes('webb') || lowerTitle.includes('telescope') || lowerTitle.includes('hubble')) {
              imageUrl = spaceImages[3]
            } else if (lowerTitle.includes('galaxy') || lowerTitle.includes('star') || lowerTitle.includes('dust')) {
              imageUrl = spaceImages[4]
            } else if (lowerTitle.includes('spacex') || lowerTitle.includes('rocket') || lowerTitle.includes('launch')) {
              imageUrl = spaceImages[5]
            } else if (lowerTitle.includes('saturn') || lowerTitle.includes('planet')) {
              imageUrl = spaceImages[6]
            } else {
              // Default to a random space image
              imageUrl = spaceImages[Math.floor(Math.random() * spaceImages.length)]
            }
          }
          
          // Clean up title - remove extra whitespace and metadata
          if (title) {
            title = title.replace(/\s+/g, ' ').replace(/By\s+.*?last updated.*$/i, '').trim()
            if (title.includes('Homepage') || title.includes('Video') || title.length < 10) {
              return // Skip non-article content
            }
          }
          
          // Get summary/description
          const summaryEl = $el.find(".summary, .description, .excerpt, p").first()
          summary = summaryEl.text().trim() || title

          if (title && link && title.length > 10 && !title.toLowerCase().includes('homepage')) {
            // Ensure absolute URL
            if (link.startsWith("/")) {
              link = `https://www.space.com${link}`
            } else if (!link.startsWith("http")) {
              link = `https://www.space.com/${link}`
            }
            
            const article: Article = {
              id: generateIdFromLink(link),
              title: title.slice(0, 200),
              summary: summary.slice(0, 300) || title.slice(0, 300),
              content: `Read the full article at Space.com: ${link}`,
              imageUrl: imageUrl,
              date: new Date().toISOString(),
              source: "Space.com",
            }

            results.push(article)
          }
        })

        if (results.length > 0) {
          console.log(`Found ${results.length} articles with selector: ${selector} from ${url}`)
          return results.slice(0, 20) // Limit to 20 articles
        }
      }

      console.log(`No articles found at ${url}`)
    } catch (error) {
      console.log(`Error fetching ${url}:`, error)
      continue
    }
  }

  throw new Error("Could not scrape any articles from Space.com URLs")
}

// Fallback space articles in case scraping fails
const fallbackSpaceArticles: Article[] = [
  {
    id: "space-1",
    title: "SpaceX Starship Successfully Completes Orbital Test Flight",
    summary: "The massive rocket achieved key milestones in its journey toward Mars missions.",
    content: "SpaceX's Starship has completed another successful test flight, bringing the company closer to its goal of Mars colonization. The vehicle demonstrated improved heat shield performance and landing capabilities...",
    imageUrl: "https://cdn.mos.cms.futurecdn.net/placeholder-spacex-starship.jpg",
    date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    source: "Space.com",
  },
  {
    id: "space-2", 
    title: "Astronomers Detect Mysterious Radio Signals from Distant Galaxy",
    summary: "Fast radio bursts reveal new insights about the universe's magnetic fields.",
    content: "A team of astronomers has detected a series of mysterious radio signals originating from a galaxy billions of light-years away. These fast radio bursts could help scientists understand cosmic magnetism...",
    imageUrl: "https://cdn.mos.cms.futurecdn.net/placeholder-radio-telescope.jpg",
    date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    source: "Space.com",
  },
  {
    id: "space-3",
    title: "China's Space Station Receives New Research Modules",
    summary: "Tiangong space station expands capabilities for scientific experiments.",
    content: "China has successfully attached new research modules to its Tiangong space station, significantly expanding the facility's scientific capabilities for microgravity research...",
    imageUrl: "https://cdn.mos.cms.futurecdn.net/placeholder-tiangong-station.jpg", 
    date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    source: "Space.com",
  },
  {
    id: "space-4",
    title: "Europa Clipper Mission Launches to Jupiter's Icy Moon",
    summary: "NASA probe begins journey to search for signs of life in Europa's subsurface ocean.",
    content: "NASA's Europa Clipper spacecraft has begun its journey to Jupiter's moon Europa, where it will investigate the moon's subsurface ocean and potential for harboring life...",
    imageUrl: "https://cdn.mos.cms.futurecdn.net/placeholder-europa-clipper.jpg",
    date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    source: "Space.com",
  },
  {
    id: "space-5",
    title: "Breakthrough in Fusion Rocket Technology Could Enable Faster Mars Travel",
    summary: "New propulsion system could cut Mars journey time to just 3 months.",
    content: "Scientists have achieved a major breakthrough in fusion rocket technology that could revolutionize space travel, potentially reducing the journey time to Mars from 9 months to just 3 months...",
    imageUrl: "https://cdn.mos.cms.futurecdn.net/placeholder-fusion-rocket.jpg",
    date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    source: "Space.com",
  },
]

export async function GET(request: Request) {
  try {
    console.log("Space News API: Starting scrape attempt...")
    
    try {
      const articles = await scrapeSpaceNews()
      console.log(`Space News API: Successfully scraped ${articles.length} articles`)
      return NextResponse.json({ articles })
    } catch (scrapeError) {
      console.log("Space News API: Scraping failed, using fallback articles:", (scrapeError as Error).message)
      
      // Return fallback articles with a note
      const fallbackWithNote = fallbackSpaceArticles.map(article => ({
        ...article,
        summary: `${article.summary} (Note: Live Space.com feed temporarily unavailable)`,
      }))
      
      return NextResponse.json({ 
        articles: fallbackWithNote,
        note: "Using fallback space articles - live scraping temporarily unavailable"
      })
    }
  } catch (error: unknown) {
    console.error("Space News API: Fatal error:", error)
    return NextResponse.json(
      { error: (error as Error).message ?? "Failed to load space articles." },
      { status: 500 },
    )
  }
}


