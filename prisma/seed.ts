import path from 'path'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '../src/generated/prisma/client'
import QRCode from 'qrcode'

const dbPath = path.resolve(process.cwd(), 'dev.db')
const adapter = new PrismaBetterSqlite3({ url: dbPath })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database…')

  // ── Crews ──────────────────────────────────────────────
  const existingCrews = await prisma.crew.count()
  let crews

  if (existingCrews === 0) {
    crews = await Promise.all([
      prisma.crew.create({
        data: {
          name: 'Busan Runners',
          location: 'Busan, Haeundae',
          captainName: 'Kim Jae-won',
          captainContact: '010-1234-5678',
        },
      }),
      prisma.crew.create({
        data: {
          name: 'Seoul Trail Crew',
          location: 'Seoul, Mapo',
          captainName: 'Lee So-yeon',
          captainContact: 'soyeon@seoultrail.kr',
        },
      }),
      prisma.crew.create({
        data: {
          name: 'Jeju Cyclists',
          location: 'Jeju Island',
          captainName: 'Park Min-jun',
          captainContact: '010-9876-5432',
        },
      }),
    ])
    console.log(`  Created ${crews.length} crews`)
  } else {
    crews = await prisma.crew.findMany()
    console.log(`  Skipping crews — ${existingCrews} already exist`)
  }

  // ── Campaign ────────────────────────────────────────────
  let campaign = await prisma.campaign.findFirst({
    where: { name: 'Kodapop Wadiz July 2026' },
  })

  if (!campaign) {
    campaign = await prisma.campaign.create({
      data: {
        name: 'Kodapop Wadiz July 2026',
        wadizBaseUrl: 'https://www.wadiz.kr/web/campaign/detail/999999',
        startDate: new Date('2026-07-01'),
        endDate: new Date('2026-07-31'),
      },
    })
    console.log(`  Created campaign: ${campaign.name}`)
  } else {
    console.log(`  Skipping campaign — already exists`)
  }

  // ── Drops ───────────────────────────────────────────────
  const existingDrops = await prisma.drop.count()

  if (existingDrops === 0) {
    for (const crew of crews) {
      const drop = await prisma.drop.create({
        data: {
          crewId: crew.id,
          campaignId: campaign.id,
          quantity: 24,
          notes: '1 pallet — delivered to captain',
          status: 'DELIVERED',
          utmUrl: '',
          dispatchedAt: new Date('2026-07-03'),
          deliveredAt: new Date('2026-07-05'),
        },
      })

      const utmUrl =
        `${campaign.wadizBaseUrl}` +
        `?utm_source=pulsedrop&utm_medium=qr&utm_campaign=${crew.id}&utm_content=${drop.id}`

      const qrDataUri = await QRCode.toDataURL(utmUrl, { width: 400, margin: 2 })

      await prisma.drop.update({
        where: { id: drop.id },
        data: { utmUrl, qrCodePath: qrDataUri },
      })

      console.log(`  Created drop for ${crew.name}`)
    }
  } else {
    console.log(`  Skipping drops — ${existingDrops} already exist`)
  }

  console.log('Seed complete.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
