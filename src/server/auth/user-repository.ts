// 用户数据访问 — Prisma User repository

import { prisma } from "@/server/db/client"
import type { User } from "@prisma/client"

export async function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
}

export async function findUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } })
}

export async function createUser(input: {
  email: string
  name: string
  passwordHash: string
}): Promise<User> {
  return prisma.user.create({
    data: {
      email: input.email.toLowerCase().trim(),
      name: input.name.trim(),
      passwordHash: input.passwordHash,
    },
  })
}
