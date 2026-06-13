// GET /api/auth/me — 获取当前用户信息
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken } from "@/server/auth/jwt"
import { findUserById } from "@/server/auth/user-repository"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("vf_token")?.value

    if (!token) {
      return NextResponse.json({ user: null })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ user: null })
    }

    const user = await findUserById(payload.userId)
    if (!user) {
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
    })
  } catch {
    return NextResponse.json({ user: null })
  }
}
