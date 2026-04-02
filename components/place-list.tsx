'use client'

import Image from 'next/image'
import { LostPlace, categoryLabels, difficultyLabels, difficultyColors } from '@/lib/types'
import { ScrollArea } from '@/components/ui/scroll-area'

interface PlaceListProps {
  places: LostPlace[]
  onSelectPlace: (place: LostPlace) => void
}

export function PlaceList({ places, onSelectPlace }: PlaceListProps) {
  if (places.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 bg-background">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/30">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 text-muted-foreground">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <p className="text-muted-foreground">Keine Orte gefunden</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full bg-background">
      <div className="p-4 space-y-3">
        {places.map((place) => (
          <button
            key={place.id}
            onClick={() => onSelectPlace(place)}
            className="w-full bg-card rounded-xl border border-border/30 overflow-hidden hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all text-left flex group"
          >
            {/* Thumbnail */}
            <div className="w-28 h-28 sm:w-36 sm:h-36 relative shrink-0 bg-black">
              {place.images[0] && (
                <Image
                  src={place.images[0]}
                  alt={place.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
              <div>
                <h3 className="font-semibold truncate text-foreground group-hover:text-primary transition-colors">{place.name}</h3>
                <p className="text-sm text-primary font-medium">{categoryLabels[place.category]}</p>
              </div>

              <div className="flex gap-2 mt-3 flex-wrap">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium text-white ${difficultyColors[place.difficulty]}`}>
                  {difficultyLabels[place.difficulty]}
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium text-white ${difficultyColors[place.terrain]}`}>
                  {difficultyLabels[place.terrain]}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  )
}
