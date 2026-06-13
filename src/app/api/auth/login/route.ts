// POST /api/auth/login — 用户登录
import { NextResponse } from "next/server"
import { z } from "zod"
import { verifyPassword } from "@/server/auth/password"
import { signToken } from "@/server/auth/jwt"
import { findUserByEmail } from "@/server/auth/user-repository"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "请输入密码"),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "请输入有效的邮箱和密码" },
        { status: 422 },
      )
    }

    const { email, password } = parsed.data

    // 查找用户
    const user = await findUserByEmail(email)
    if (!user) {
      return NextResponse.json(
        { error: "邮箱或密码不正确" },
        { status: 401 },
      )
    }

    // 验证密码
    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json(
        { error: "邮箱或密码不正确" },
        { status: 401 },
      )
    }

    // 签发 JWT
    const token = await signToken({ userId: user.id, email: user.email, name: user.name })

    const response = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
    })

    response.cookies.set("vf_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "登录失败，请稍后再试" },
      { status: 500 },
    )
  }
}
