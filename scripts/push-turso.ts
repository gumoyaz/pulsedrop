import 'dotenv/config'
import { createClient } from '@libsql/client'

const url = process.env.TURSO_URL
const authToken = process.env.DATABASE_AUTH_TOKEN

if (!url || !authToken) {
  console.error('Set TURSO_URL and DATABASE_AUTH_TOKEN before running this script.')
  process.exit(1)
}

const db = createClient({ url, authToken })

const statements = [
  // Drop in reverse dependency order
  `DROP TABLE IF EXISTS "Drop"`,
  `DROP TABLE IF EXISTS "Campaign"`,
  `DROP TABLE IF EXISTS "Crew"`,
  `DROP TABLE IF EXISTS "_prisma_migrations"`,

  `CREATE TABLE "Crew" (
    "id"             TEXT NOT NULL PRIMARY KEY,
    "name"           TEXT NOT NULL,
    "location"       TEXT NOT NULL,
    "captainName"    TEXT NOT NULL,
    "captainContact" TEXT NOT NULL,
    "createdAt"      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      DATETIME NOT NULL
  )`,

  `CREATE TABLE "Campaign" (
    "id"           TEXT NOT NULL PRIMARY KEY,
    "name"         TEXT NOT NULL,
    "wadizBaseUrl" TEXT NOT NULL,
    "startDate"    DATETIME,
    "endDate"      DATETIME,
    "createdAt"    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    DATETIME NOT NULL
  )`,

  `CREATE TABLE "Drop" (
    "id"           TEXT NOT NULL PRIMARY KEY,
    "crewId"       TEXT NOT NULL,
    "campaignId"   TEXT NOT NULL,
    "status"       TEXT NOT NULL DEFAULT 'PENDING',
    "quantity"     INTEGER NOT NULL,
    "notes"        TEXT,
    "utmUrl"       TEXT NOT NULL,
    "qrCodePath"   TEXT,
    "dispatchedAt" DATETIME,
    "deliveredAt"  DATETIME,
    "createdAt"    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    DATETIME NOT NULL,
    CONSTRAINT "Drop_crewId_fkey"     FOREIGN KEY ("crewId")     REFERENCES "Crew"("id")     ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Drop_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE
  )`,

  `CREATE INDEX "Drop_crewId_idx"     ON "Drop"("crewId")`,
  `CREATE INDEX "Drop_campaignId_idx" ON "Drop"("campaignId")`,

  `CREATE TABLE "_prisma_migrations" (
    "id"                  TEXT NOT NULL PRIMARY KEY,
    "checksum"            TEXT NOT NULL,
    "finished_at"         DATETIME,
    "migration_name"      TEXT NOT NULL,
    "logs"                TEXT,
    "rolled_back_at"      DATETIME,
    "started_at"          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0
  )`,
]

async function main() {
  console.log('Pushing schema to Turso…')
  for (const sql of statements) {
    await db.execute(sql)
  }
  console.log('Done. Run `npm run seed` next.')
}

main().catch((e) => { console.error(e); process.exit(1) })
