"use client"

import { useEffect, useState } from "react"

interface SpaceObject {
  id: number
  type: 'planet' | 'asteroid' | 'comet' | 'space-dust'
  left: number
  delay: number
}

export function SpaceEffects() {
  const [objects, setObjects] = useState<SpaceObject[]>([])

  useEffect(() => {
    // Generate space objects
    const newObjects: SpaceObject[] = []
    
    // Add planets (fewer, more noticeable)
    for (let i = 0; i < 3; i++) {
      newObjects.push({
        id: i,
        type: 'planet',
        left: Math.random() * 100,
        delay: Math.random() * 20
      })
    }
    
    // Add asteroids
    for (let i = 0; i < 5; i++) {
      newObjects.push({
        id: i + 3,
        type: 'asteroid',
        left: Math.random() * 100,
        delay: Math.random() * 20
      })
    }
    
    // Add comets
    for (let i = 0; i < 4; i++) {
      newObjects.push({
        id: i + 8,
        type: 'comet',
        left: Math.random() * 100,
        delay: Math.random() * 20
      })
    }
    
    // Add space dust (more, but subtle)
    for (let i = 0; i < 8; i++) {
      newObjects.push({
        id: i + 12,
        type: 'space-dust',
        left: Math.random() * 100,
        delay: Math.random() * 20
      })
    }
    
    setObjects(newObjects)
  }, [])

  return (
    <>
      {/* Nebula effects */}
      <div className="nebula"></div>
      <div className="nebula-2"></div>
      
      {/* Shooting stars */}
      <div 
        className="shooting-star" 
        style={{
          top: '20%',
          left: '10%',
          animationDelay: '0s',
          animationDuration: '4s'
        }}
      ></div>
      <div 
        className="shooting-star" 
        style={{
          top: '60%',
          left: '80%',
          animationDelay: '8s',
          animationDuration: '3s'
        }}
      ></div>
      <div 
        className="shooting-star" 
        style={{
          top: '40%',
          left: '30%',
          animationDelay: '15s',
          animationDuration: '5s'
        }}
      ></div>
      
      {/* Floating space objects */}
      <div className="space-objects">
        {objects.map((obj) => (
          <div
            key={obj.id}
            className={`space-object ${obj.type}`}
            style={{
              left: `${obj.left}%`,
              animationDelay: `${obj.delay}s`
            }}
          />
        ))}
      </div>
    </>
  )
}

