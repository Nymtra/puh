import { put } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  // Check authentication
  const cookieStore = await cookies()
  const session = cookieStore.get('lostplaces_session')
  
  if (session?.value !== 'authenticated') {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Keine Datei hochgeladen' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Nur Bilder erlaubt' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Datei zu groß (max 5MB)' }, { status: 400 })
    }

    const blob = await put(`lostplaces/${Date.now()}-${file.name}`, file, {
      access: 'public',
    })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload fehlgeschlagen' }, { status: 500 })
  }
}
