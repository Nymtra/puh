'use client'

import { useEffect, useState, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { LostPlace, Category } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Crosshair, Layers, Loader2 } from 'lucide-react'

// Clean SVG icons for categories
const categoryIcons: Record<Category, { svg: string; color: string }> = {
  industrie: { 
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 20h20M4 20V10l6 4V10l6 4V4h4v16"/></svg>`,
    color: '#10b981'
  },
  haus: { 
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    color: '#22c55e'
  },
  bunker: { 
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    color: '#6b7280'
  },
  krankenhaus: { 
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M9 8h6M12 8v6M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/></svg>`,
    color: '#ef4444'
  },
  kirche: { 
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M8 6h8M6 22V10l6-4 6 4v12H6z"/><path d="M10 22v-4h4v4"/></svg>`,
    color: '#f59e0b'
  },
  sonstiges: { 
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
    color: '#14b8a6'
  },
}

function createMarkerIcon(category: Category) {
  const { svg, color } = categoryIcons[category]
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background: ${color};
        width: 36px;
        height: 36px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid rgba(255,255,255,0.9);
        box-shadow: 0 3px 12px rgba(0,0,0,0.5);
      ">
        <div style="
          transform: rotate(45deg);
          width: 18px;
          height: 18px;
          color: white;
        ">${svg}</div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  })
}

interface MapComponentProps {
  places: LostPlace[]
  onSelectPlace: (place: LostPlace) => void
  selectedPlace: LostPlace | null
}

export default function MapComponent({ places, onSelectPlace, selectedPlace }: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const userMarkerRef = useRef<L.Marker | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard')
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: [47.5, 14.0],
      zoom: 7,
      zoomControl: false,
    })

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    // Dark styled map
    const standardLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    })

    standardLayer.addTo(map)
    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Handle map type change
  useEffect(() => {
    if (!mapRef.current) return

    const map = mapRef.current

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer)
      }
    })

    if (mapType === 'satellite') {
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
      }).addTo(map)
    } else {
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      }).addTo(map)
    }
  }, [mapType])

  // Handle markers
  useEffect(() => {
    if (!mapRef.current) return

    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    places.forEach(place => {
      const marker = L.marker([place.latitude, place.longitude], {
        icon: createMarkerIcon(place.category),
      })

      marker.on('click', () => {
        onSelectPlace(place)
      })

      marker.addTo(mapRef.current!)
      markersRef.current.push(marker)
    })
  }, [places, onSelectPlace])

  // Center on selected place
  useEffect(() => {
    if (!mapRef.current || !selectedPlace) return
    mapRef.current.setView([selectedPlace.latitude, selectedPlace.longitude], 14, {
      animate: true,
    })
  }, [selectedPlace])

  // Handle location tracking
  const handleLocate = () => {
    if (!mapRef.current) return

    setIsLocating(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        
        if (userMarkerRef.current) {
          userMarkerRef.current.remove()
        }

        const userIcon = L.divIcon({
          className: 'user-marker',
          html: `
            <div style="
              width: 16px;
              height: 16px;
              background: #10b981;
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 0 0 6px rgba(16, 185, 129, 0.3), 0 2px 8px rgba(0,0,0,0.4);
            "></div>
          `,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        })

        userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon })
          .addTo(mapRef.current!)

        mapRef.current!.setView([latitude, longitude], 14, { animate: true })
        setIsLocating(false)
      },
      (error) => {
        setIsLocating(false)
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Standortzugriff verweigert')
            break
          case error.POSITION_UNAVAILABLE:
            setLocationError('Standort nicht verfügbar')
            break
          case error.TIMEOUT:
            setLocationError('Zeitüberschreitung')
            break
          default:
            setLocationError('Standortfehler')
        }
        setTimeout(() => setLocationError(null), 3000)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  return (
    <div className="h-full w-full relative">
      <div ref={containerRef} className="h-full w-full" />
      
      {/* Map controls - top left */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleLocate}
          disabled={isLocating}
          className="shadow-lg bg-card/95 hover:bg-card border border-border/50 gap-2"
        >
          {isLocating ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : (
            <Crosshair className="h-4 w-4 text-primary" />
          )}
          <span className="text-foreground">Standort</span>
        </Button>
        
        {locationError && (
          <div className="bg-destructive/90 text-destructive-foreground text-xs px-3 py-2 rounded-lg shadow-lg">
            {locationError}
          </div>
        )}
      </div>

      {/* Map type toggle - bottom left (above view toggle) */}
      <div className="absolute bottom-16 left-4 z-[1000]">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setMapType(mapType === 'standard' ? 'satellite' : 'standard')}
          className="shadow-lg bg-card/95 hover:bg-card border border-border/50 gap-2"
        >
          <Layers className="h-4 w-4 text-primary" />
          <span className="text-foreground">{mapType === 'standard' ? 'Satellit' : 'Standard'}</span>
        </Button>
      </div>

      {/* Custom styles for markers */}
      <style jsx global>{`
        .custom-marker {
          background: transparent;
          border: none;
        }
        .user-marker {
          background: transparent;
          border: none;
        }
        .leaflet-control-zoom a {
          background: oklch(0.12 0.01 260) !important;
          color: oklch(0.95 0.01 260) !important;
          border-color: oklch(0.25 0.01 260) !important;
        }
        .leaflet-control-zoom a:hover {
          background: oklch(0.18 0.01 260) !important;
        }
        .leaflet-control-attribution {
          background: oklch(0.08 0.01 260 / 0.9) !important;
          color: oklch(0.55 0.01 260) !important;
          font-size: 10px !important;
        }
        .leaflet-control-attribution a {
          color: oklch(0.65 0.19 160) !important;
        }
      `}</style>
    </div>
  )
}
