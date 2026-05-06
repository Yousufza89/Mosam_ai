import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export async function POST() {
  try {
    console.log("Attempting to create admin user...")
    
    // Check database connection
    try {
      await prisma.$connect()
      console.log("Database connection successful")
    } catch (dbError) {
      console.error("Database connection failed:", dbError)
      return NextResponse.json(
        { error: "Database connection failed", details: dbError instanceof Error ? dbError.message : "Unknown error" },
        { status: 500 }
      )
    }

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'yousuf@admin.com' }
    })

    if (existingAdmin) {
      console.log("Admin user already exists:", existingAdmin.email)
      return NextResponse.json({
        message: "Admin user already exists",
        admin: {
          email: existingAdmin.email,
          name: existingAdmin.name,
          role: existingAdmin.role,
          id: existingAdmin.id
        }
      })
    }

    // Hash the admin password
    console.log("Hashing admin password...")
    const hashedPassword = await bcrypt.hash('admin123', 10)
    console.log("Password hashed successfully")

    // Create admin user
    console.log("Creating admin user...")
    const admin = await prisma.user.create({
      data: {
        email: 'yousuf@admin.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN'
      }
    })

    console.log("Admin user created successfully:", admin.email)

    return NextResponse.json({
      message: "Admin user created successfully",
      admin: {
        email: admin.email,
        name: admin.name,
        role: admin.role,
        id: admin.id
      }
    })

  } catch (error) {
    console.error("Error creating admin user:", error)
    return NextResponse.json(
      { 
        error: "Failed to create admin user",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET() {
  try {
    await prisma.$connect()
    
    const adminUser = await prisma.user.findUnique({
      where: { email: 'yousuf@admin.com' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      adminExists: !!adminUser,
      adminUser,
      message: adminUser ? "Admin account exists" : "Admin account not found"
    })

  } catch (error) {
    console.error("Error checking admin user:", error)
    return NextResponse.json(
      { 
        error: "Failed to check admin user",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
