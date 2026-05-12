import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Simulate real-time data - in production, this would come from database
    const stats = {
      accuracy: "89%",
      cities: "5",
      latency: "Dynamic",
      uptime: "99.9%",
      activeUsers: "1,247",
      todayPredictions: "3,421"
    }

    return NextResponse.json(stats)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch homepage statistics' },
      { status: 500 }
    )
  }
}
