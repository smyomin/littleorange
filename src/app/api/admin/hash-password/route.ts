import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json()
    if (!password) return NextResponse.json({ error: 'Password required' }, { status: 400 })
    const hash = await bcrypt.hash(password, 12)
    return NextResponse.json({ hash })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}