import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    { error: 'Redirect fuer Zahlungsmethoden ist noch nicht implementiert.' },
    { status: 501 },
  )
}

export async function POST() {
  return NextResponse.json(
    { error: 'Redirect fuer Zahlungsmethoden ist noch nicht implementiert.' },
    { status: 501 },
  )
}
