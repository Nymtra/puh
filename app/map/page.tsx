'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import useSWR from 'swr'
import { LostPlace } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { MapIcon, List, Plus, LogOut, Loader2 } from 'lucide-react'
import { PlaceDetail } from '@/components/place-detail'
import { PlaceList } from '@/components/place-list'
import { CreatePlaceDialog } from '@/components/create-place-dialog'

const MapComponent = dynamic(() => import('@/components/map-component'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-card/50">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span>Karte wird geladen...</span>
      </div>
    </div>
  ),
})

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Fehler beim Laden')
  return res.json()
})

export default function MapPage() {
  const router = useRouter()
  const [view, setView] = useState<'map' | 'list'>('map')
  const [selectedPlace, setSelectedPlace] = useState<LostPlace | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  const { data: places, error, mutate } = useSWR<LostPlace[]>('/api/places', fetcher)

  useEffect(() => {
    fetch('/api/auth')
      .then(res => res.json())
      .then(data => {
        if (!data.authenticated) {
          router.push('/')
        } else {
          setCheckingAuth(false)
        }
      })
      .catch(() => router.push('/'))
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/')
  }

  const handlePlaceCreated = () => {
    mutate()
    setIsCreateOpen(false)
  }

  if (checkingAuth) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span>Lade...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <p className="text-destructive">Fehler beim Laden der Orte</p>
        <Button onClick={() => mutate()} variant="outline">
          Erneut versuchen
        </Button>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-card border-b border-border/30 shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-primary">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <h1 className="font-bold text-lg tracking-tight text-foreground">RSPPLP Austria</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Ort hinzufügen</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            title="Ausloggen"
            className="text-muted-foreground hover:text-foreground hover:bg-muted/30"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 relative overflow-hidden">
        {view === 'map' ? (
          <MapComponent 
            places={places || []} 
            onSelectPlace={setSelectedPlace}
            selectedPlace={selectedPlace}
          />
        ) : (
          <PlaceList 
            places={places || []} 
            onSelectPlace={setSelectedPlace} 
          />
        )}

        {/* View toggle - bottom left */}
        <div className="absolute bottom-4 left-4 z-[1000]">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setView(view === 'map' ? 'list' : 'map')}
            className="shadow-lg bg-card/95 hover:bg-card border border-border/50 gap-2"
          >
            {view === 'map' ? (
              <>
                <List className="h-4 w-4 text-primary" />
                <span className="text-foreground">Liste</span>
              </>
            ) : (
              <>
                <MapIcon className="h-4 w-4 text-primary" />
                <span className="text-foreground">Karte</span>
              </>
            )}
          </Button>
        </div>
      </main>

      {/* Place detail overlay */}
      {selectedPlace && (
        <PlaceDetail 
          place={selectedPlace} 
          onClose={() => setSelectedPlace(null)} 
        />
      )}

      {/* Create place dialog */}
      <CreatePlaceDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreated={handlePlaceCreated}
      />
    </div>
  )
}
