import { PrismaLibSql } from '@prisma/adapter-libsql'
import { PrismaClient } from '@/generated/prisma/client'

function resolveDbUrl(): string {
  const url = process.env.DATABASE_URL ?? 'file:./dev.db'
  // Remote Turso URL — use as-is
  if (url.startsWith('libsql://')) return url
  // Vercel serverless — instrumentation.ts copies dev.db to /tmp at startup
  if (process.env.VERCEL) return 'file:/tmp/pulsedrop.db'
  return url
}

function createPrismaClient() {
  const adapter = new PrismaLibSql({
    url: resolveDbUrl(),
    authToken: process.env.DATABASE_AUTH_TOKEN,
  })
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
