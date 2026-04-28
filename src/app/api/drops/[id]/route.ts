import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const VALID_STATUSES = ['PENDING', 'DISPATCHED', 'DELIVERED'] as const
type DropStatus = (typeof VALID_STATUSES)[number]

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const { status } = body as { status: DropStatus }

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: `status must be one of: ${VALID_STATUSES.join(', ')}` },
      { status: 400 }
    )
  }

  // Smart timestamps: set once on first transition, never overwrite.
  const existing = await prisma.drop.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Drop not found' }, { status: 404 })
  }

  const timestampData: { dispatchedAt?: Date; deliveredAt?: Date } = {}
  if (status === 'DISPATCHED' && !existing.dispatchedAt) {
    timestampData.dispatchedAt = new Date()
  }
  if (status === 'DELIVERED' && !existing.deliveredAt) {
    timestampData.deliveredAt = new Date()
  }

  const updated = await prisma.drop.update({
    where: { id },
    data: { status, ...timestampData },
    include: { crew: true, campaign: true },
  })

  return NextResponse.json(updated)
}
