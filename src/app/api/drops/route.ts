import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { crewId, campaignId, quantity, notes } = body

  if (!crewId || !campaignId || !quantity) {
    return NextResponse.json({ error: 'crewId, campaignId, and quantity are required' }, { status: 400 })
  }

  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } })
  if (!campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
  }

  // Step 1: create the Drop to get a stable ID
  const drop = await prisma.drop.create({
    data: {
      crewId,
      campaignId,
      quantity: Number(quantity),
      notes: notes || null,
      utmUrl: '',
    },
  })

  // Step 2: build the UTM URL using the generated drop ID
  const utmUrl =
    `${campaign.wadizBaseUrl}` +
    `?utm_source=pulsedrop&utm_medium=qr&utm_campaign=${crewId}&utm_content=${drop.id}`

  // Step 3: generate QR code as a base64 Data URI
  const qrDataUri = await QRCode.toDataURL(utmUrl, { width: 400, margin: 2 })

  // Step 4: persist both fields
  const updated = await prisma.drop.update({
    where: { id: drop.id },
    data: { utmUrl, qrCodePath: qrDataUri },
    include: { crew: true, campaign: true },
  })

  return NextResponse.json(updated, { status: 201 })
}
