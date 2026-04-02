import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyPassword } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    
    if (!password) {
      return NextResponse.json({ error: 'Passwort fehlt' }, { status: 400 })
    }

    if (verifyPassword(password)) {
      const cookieStore = await cookies()
      // Set a session cookie that expires in 30 days
      cookieStore.set('lostplaces_session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      })
      
      return NextResponse.json({ success: true })
    }
    
    return NextResponse.json({ error: 'Falsches Passwort' }, { status: 401 })
  } catch {
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}

export async function GET() {
  const cookieStore = await cookies()
  const session = cookieStore.get('lostplaces_session')
  
  return NextResponse.json({ 
    authenticated: session?.value === 'authenticated' 
  })
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete('lostplaces_session')
  
  return NextResponse.json({ success: true })
}
