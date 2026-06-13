// 密码哈希 — 使用 Web Crypto API，无需额外依赖
// salt 使用 crypto.randomUUID，hash 使用 SHA-256

const encoder = new TextEncoder()

async function sha256(data: string): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", encoder.encode(data))
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomUUID()
  const hash = await sha256(password + salt)
  return `${salt}:${hash}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(":")
  if (!salt || !hash) return false
  const computed = await sha256(password + salt)
  return computed === hash
}
