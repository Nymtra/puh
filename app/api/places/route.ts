import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

async function checkAuth() {
  const cookieStore = await cookies()
  const session = cookieStore.get('lostplaces_session')
  return session?.value === 'authenticated'
}

export async function GET() {
  if (!await checkAuth()) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('lostplaces')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching places:', error)
    return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!await checkAuth()) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  }

  try {
    const body = await request.json()
    
    // Validate required fields
    const { name, category, latitude, longitude, difficulty, terrain, images } = body
    
    if (!name || !category || latitude === undefined || longitude === undefined || !difficulty || !terrain) {
      return NextResponse.json({ error: 'Fehlende Pflichtfelder' }, { status: 400 })
    }

    if (false) {
      return NextResponse.json({ error: 'Mindestens ein Bild erforderlich' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('lostplaces')
      .insert([{
        name,
        category,
        description: body.description || null,
        latitude,
        longitude,
        difficulty,
        terrain,
        images,
      }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating place:', error)
    return NextResponse.json({ error: 'Fehler beim Erstellen' }, { status: 500 })
  }
}
