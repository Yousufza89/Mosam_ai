import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Test database connection
    try {
      await prisma.$connect()
    } catch (dbError) {
      console.error("Database connection error during delete:", dbError)
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 503 }
      )
    }

    const resolvedParams = await params
    let predictionId = resolvedParams?.id

    if (!predictionId) {
      const url = new URL(request.url)
      const parts = url.pathname.split("/").filter(Boolean)
      const last = parts[parts.length - 1]
      if (last && last !== "predictions") {
        predictionId = last
      }
    }

    if (!predictionId) {
      return NextResponse.json(
        { error: "Prediction id is required" },
        { status: 400 }
      )
    }

    // Check if prediction exists and belongs to user
    const prediction = await prisma.prediction.findUnique({
      where: { id: predictionId }
    })

    if (!prediction) {
      return NextResponse.json(
        { error: "Prediction not found" },
        { status: 404 }
      )
    }

    if (prediction.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden - You can only delete your own predictions" },
        { status: 403 }
      )
    }

    await prisma.prediction.delete({
      where: { id: predictionId }
    })

    return NextResponse.json({
      message: "Prediction deleted successfully"
    })

  } catch (error: any) {
    console.error("Delete prediction error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to delete prediction" },
      { status: 500 }
    )
  }
}
