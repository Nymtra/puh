'use client'

import { useState } from 'react'
import Image from 'next/image'
import { LostPlace, categoryLabels, difficultyLabels, difficultyColors } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { X, Navigation, ChevronLeft, ChevronRight, Mountain, Footprints } from 'lucide-react'

interface PlaceDetailProps {
  place: LostPlace
  onClose: () => void
}

const navigationOptions = [
  { name: 'Google Maps', icon: '🗺️', getUrl: (lat: number, lng: number) => `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}` },
  { name: 'Apple Maps', icon: '🍎', getUrl: (lat: number, lng: number) => `https://maps.apple.com/?daddr=${lat},${lng}` },
  { name: 'Waze', icon: '🚗', getUrl: (lat: number, lng: number) => `https://waze.com/ul?ll=${lat},${lng}&navigate=yes` },
  { name: 'HERE WeGo', icon: '📍', getUrl: (lat: number, lng: number) => `https://share.here.com/r/${lat},${lng}` },
]

export function PlaceDetail({ place, onClose }: PlaceDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showNavOptions, setShowNavOptions] = useState(false)

  const handleNavigate = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
    setShowNavOptions(false)
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % place.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + place.images.length) % place.images.length)
  }

  return (
    <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-card w-full sm:max-w-lg sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300 border border-border/30">
        {/* Image carousel */}
        <div className="relative aspect-video bg-black shrink-0">
          {place.images.length > 0 && (
            <Image
              src={place.images[currentImageIndex]}
              alt={place.name}
              fill
              className="object-cover"
              priority
            />
          )}
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-black/30" />
          
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white border-0"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Image navigation */}
          {place.images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white border-0"
                onClick={prevImage}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white border-0"
                onClick={nextImage}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
              
              {/* Image indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {place.images.map((_, index) => (
                  <button
                    key={index}
                    className={`h-1.5 rounded-full transition-all ${
                      index === currentImageIndex ? 'w-6 bg-primary' : 'w-1.5 bg-white/40'
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* Title and category */}
          <div>
            <h2 className="text-xl font-bold text-foreground">{place.name}</h2>
            <p className="text-primary text-sm font-medium mt-0.5">{categoryLabels[place.category]}</p>
          </div>

          {/* Difficulty badges */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-2">
              <Mountain className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Schwierigkeit:</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium text-white ${difficultyColors[place.difficulty]}`}>
                {difficultyLabels[place.difficulty]}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-2">
              <Footprints className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Umgebung:</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium text-white ${difficultyColors[place.terrain]}`}>
                {difficultyLabels[place.terrain]}
              </span>
            </div>
          </div>

          {/* Description */}
          {place.description && (
            <div className="bg-muted/20 rounded-xl p-4 border border-border/20">
              <p className="text-sm text-muted-foreground leading-relaxed">{place.description}</p>
            </div>
          )}

          {/* Coordinates */}
          <div className="text-xs text-muted-foreground/60 font-mono">
            {place.latitude.toFixed(5)}, {place.longitude.toFixed(5)}
          </div>
        </div>

        {/* Navigation button */}
        <div className="p-5 border-t border-border/30 shrink-0 space-y-3">
          {showNavOptions ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground text-center mb-3">Navigations-App wählen</p>
              <div className="grid grid-cols-2 gap-2">
                {navigationOptions.map((option) => (
                  <Button
                    key={option.name}
                    variant="secondary"
                    className="h-12 justify-start gap-2 bg-muted/30 hover:bg-muted/50 border border-border/30"
                    onClick={() => handleNavigate(option.getUrl(place.latitude, place.longitude))}
                  >
                    <span className="text-lg">{option.icon}</span>
                    <span className="text-sm">{option.name}</span>
                  </Button>
                ))}
              </div>
              <Button 
                variant="ghost" 
                className="w-full text-muted-foreground hover:text-foreground"
                onClick={() => setShowNavOptions(false)}
              >
                Abbrechen
              </Button>
            </div>
          ) : (
            <Button 
              className="w-full h-12 text-base font-semibold gap-2 bg-primary hover:bg-primary/90"
              onClick={() => setShowNavOptions(true)}
            >
              <Navigation className="h-4 w-4" />
              Navigation starten
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
