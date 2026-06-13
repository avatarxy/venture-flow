// POST /api/auth/register — 用户注册
import { NextResponse } from "next/server"
import { z } from "zod"
import { hashPassword } from "@/server/auth/password"
import { signToken } from "@/server/auth/jwt"
import { findUserByEmail, createUser } from "@/server/auth/user-repository"

const registerSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  name: z.string().min(1, "请输入姓名").max(50, "姓名不能超过50个字"),
  password: z.string().min(6, "密码至少需要6个字符").max(100),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "输入校验失败" },
        { status: 422 },
      )
    }

    const { email, name, password } = parsed.data

    // 检查邮箱是否已注册
    const existing = await findUserByEmail(email)
    if (existing) {
      return NextResponse.json(
        { error: "该邮箱已注册" },
        { status: 409 },
      )
    }

    // 创建用户
    const passwordHash = await hashPassword(password)
    const user = await createUser({ email, name, passwordHash })

    // 签发 JWT
    const token = await signToken({ userId: user.id, email: user.email, name: user.name })

    // 设置 httpOnly cookie
    const response = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
    })

    response.cookies.set("vf_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 天
    })

    return response
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json(
      { error: "注册失败，请稍后再试" },
      { status: 500 },
    )
  }
}
