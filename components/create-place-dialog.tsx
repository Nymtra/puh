'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Category, Difficulty, categoryLabels, difficultyLabels } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { X, Loader2, Crosshair, Plus, ChevronLeft, ChevronRight, Link, Trash2 } from 'lucide-react'

interface CreatePlaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}

export function CreatePlaceDialog({ open, onOpenChange, onCreated }: CreatePlaceDialogProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<Category>('sonstiges')
  const [description, setDescription] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>('moderat')
  const [terrain, setTerrain] = useState<Difficulty>('moderat')
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [newImageUrl, setNewImageUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [locating, setLocating] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const resetForm = () => {
    setName('')
    setCategory('sonstiges')
    setDescription('')
    setLatitude('')
    setLongitude('')
    setDifficulty('moderat')
    setTerrain('moderat')
    setImageUrls([])
    setNewImageUrl('')
    setError('')
    setCurrentImageIndex(0)
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  const addImageUrl = () => {
    if (!newImageUrl.trim()) return
    
    // Basic URL validation
    try {
      new URL(newImageUrl)
      setImageUrls(prev => [...prev, newImageUrl.trim()])
      setNewImageUrl('')
      setError('')
    } catch {
      setError('Ungültige URL')
    }
  }

  const removeImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index))
    if (currentImageIndex >= imageUrls.length - 1) {
      setCurrentImageIndex(Math.max(0, imageUrls.length - 2))
    }
  }

  const handleGetLocation = () => {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6))
        setLongitude(position.coords.longitude.toFixed(6))
        setLocating(false)
      },
      (err) => {
        setError('Standort konnte nicht ermittelt werden: ' + err.message)
        setLocating(false)
      },
      { enableHighAccuracy: true }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Name ist erforderlich')
      return
    }

    if (!latitude || !longitude) {
      setError('Koordinaten sind erforderlich')
      return
    }

    if (imageUrls.length === 0) {
      addImageUrl('https://raw.githubusercontent.com/AAI-Associates/FileStorage/refs/heads/main/images/Bauernhof%20(1).png')
      setError('Mindestens ein Bild-Link ist erforderlich')
      return
    }

    const lat = parseFloat(latitude)
    const lng = parseFloat(longitude)

    if (isNaN(lat) || isNaN(lng)) {
      setError('Ungültige Koordinaten')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          category,
          description: description.trim() || null,
          latitude: lat,
          longitude: lng,
          difficulty,
          terrain,
          images: imageUrls,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Fehler beim Erstellen')
      }

      resetForm()
      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Erstellen')
    } finally {
      setSubmitting(false)
    }
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % imageUrls.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#1a1a1f] w-full sm:max-w-lg sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300 border border-[#2a2a35]">
        {/* Image area */}
        <div className="relative aspect-video bg-[#0f0f12] shrink-0">
          {imageUrls.length > 0 ? (
            <>
              <Image
                src={imageUrls[currentImageIndex]}
                alt="Vorschau"
                fill
                className="object-cover"
                unoptimized
              />
              
              {/* Image navigation */}
              {imageUrls.length > 1 && (
                <>
                  <button
                    type="button"
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    className="absolute right-14 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  
                  {/* Image indicators */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {imageUrls.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`h-1.5 rounded-full transition-all ${
                          index === currentImageIndex ? 'w-6 bg-emerald-500' : 'w-1.5 bg-white/40'
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Remove current image */}
              <button
                type="button"
                className="absolute top-3 right-14 h-10 w-10 rounded-full bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center transition-colors"
                onClick={() => removeImage(currentImageIndex)}
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-500">
              <div className="h-16 w-16 rounded-full bg-[#2a2a35] flex items-center justify-center border-2 border-dashed border-gray-600">
                <Link className="h-8 w-8" />
              </div>
              <span className="text-sm">Bild-URLs hinzufügen</span>
            </div>
          )}
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1f] via-transparent to-black/30 pointer-events-none" />
          
          {/* Close button */}
          <button
            type="button"
            className="absolute top-3 right-3 h-10 w-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
            onClick={handleClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-4">
            {/* Title info */}
            <div>
              <h2 className="text-xl font-bold text-white">Neuer Ort</h2>
              <p className="text-emerald-500 text-sm font-medium mt-0.5">Lost Place hinzufügen</p>
            </div>

            {/* Image URL input */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-400">Bild-URL hinzufügen</Label>
              <div className="flex gap-2">
                <Input
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://example.com/bild.jpg"
                  className="flex-1 h-11 bg-[#252530] border-[#3a3a45] text-white placeholder:text-gray-500 focus:border-emerald-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addImageUrl()
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={addImageUrl}
                  className="h-11 px-4 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {imageUrls.length > 0 && (
                <p className="text-xs text-gray-500">{imageUrls.length} Bild(er) hinzugefügt</p>
              )}
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-400">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="z.B. Alte Fabrik"
                className="h-11 bg-[#252530] border-[#3a3a45] text-white placeholder:text-gray-500 focus:border-emerald-500"
              />
            </div>

            {/* Category - Native select for better mobile support */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-400">Kategorie</Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full h-11 px-3 rounded-md bg-[#252530] border border-[#3a3a45] text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <option key={value} value={value} className="bg-[#252530]">
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Coordinates */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-400">Koordinaten</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Breitengrad"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="flex-1 h-11 bg-[#252530] border-[#3a3a45] text-white placeholder:text-gray-500 focus:border-emerald-500"
                />
                <Input
                  placeholder="Längengrad"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="flex-1 h-11 bg-[#252530] border-[#3a3a45] text-white placeholder:text-gray-500 focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={locating}
                  title="Aktuellen Standort verwenden"
                  className="h-11 w-11 shrink-0 rounded-md bg-[#252530] border border-[#3a3a45] flex items-center justify-center hover:bg-[#303040] transition-colors disabled:opacity-50"
                >
                  {locating ? (
                    <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                  ) : (
                    <Crosshair className="h-4 w-4 text-emerald-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Difficulty and Terrain - Native selects */}
            <div className="flex gap-3">
              <div className="flex-1 space-y-2">
                <Label className="text-sm font-medium text-gray-400">Schwierigkeit</Label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                  className="w-full h-11 px-3 rounded-md bg-[#252530] border border-[#3a3a45] text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {Object.entries(difficultyLabels).map(([value, label]) => (
                    <option key={value} value={value} className="bg-[#252530]">
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1 space-y-2">
                <Label className="text-sm font-medium text-gray-400">Umgebung</Label>
                <select
                  value={terrain}
                  onChange={(e) => setTerrain(e.target.value as Difficulty)}
                  className="w-full h-11 px-3 rounded-md bg-[#252530] border border-[#3a3a45] text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {Object.entries(difficultyLabels).map(([value, label]) => (
                    <option key={value} value={value} className="bg-[#252530]">
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-400">Beschreibung</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Zusätzliche Infos zum Ort..."
                rows={3}
                className="bg-[#252530] border-[#3a3a45] text-white placeholder:text-gray-500 resize-none focus:border-emerald-500"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
          </div>

          {/* Submit button */}
          <div className="p-5 border-t border-[#2a2a35] shrink-0">
            <div className="flex gap-3">
              <Button 
                type="button" 
                onClick={handleClose} 
                className="flex-1 h-12 bg-[#252530] hover:bg-[#303040] text-white border border-[#3a3a45]"
              >
                Abbrechen
              </Button>
              <Button 
                type="submit" 
                disabled={submitting} 
                className="flex-1 h-12 text-base font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Speichern...
                  </>
                ) : (
                  'Speichern'
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
