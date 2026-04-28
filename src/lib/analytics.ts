import { BetaAnalyticsDataClient } from '@google-analytics/data'

export interface DropAnalytics {
  scans: number
  conversions: number
}

/**
 * Queries GA4 for scan and conversion data tied to a single Drop.
 *
 * Authentication: reads GOOGLE_SERVICE_ACCOUNT_KEY (the full JSON key file
 * contents as a string) and GA4_PROPERTY_ID (numeric, e.g. "123456789")
 * from the environment.
 *
 * UTM mapping used in this project:
 *   utm_source   = "pulsedrop"    → GA4 dimension: sessionSource
 *   utm_content  = Drop.id        → GA4 dimension: sessionManualAdContent
 *
 * Metrics returned:
 *   sessions   → QR code scans (each scan initiates a new session)
 *   keyEvents  → Wadiz pre-order conversions (configured as a key event in GA4)
 */
export async function getDropAnalytics(dropId: string): Promise<DropAnalytics> {
  const propertyId = process.env.GA4_PROPERTY_ID
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY

  if (!propertyId || !keyJson) {
    throw new Error(
      'Missing GA4 credentials: set GA4_PROPERTY_ID and GOOGLE_SERVICE_ACCOUNT_KEY in .env.local'
    )
  }

  const credentials = JSON.parse(keyJson) as {
    client_email: string
    private_key: string
    [key: string]: unknown
  }

  const client = new BetaAnalyticsDataClient({ credentials })

  const [response] = await client.runReport({
    property: `properties/${propertyId}`,

    dateRanges: [
      // Covers the full campaign lifetime; tighten this once you have real dates
      { startDate: '2020-01-01', endDate: 'today' },
    ],

    dimensions: [
      { name: 'sessionSource' },
      { name: 'sessionManualAdContent' },
    ],

    metrics: [
      { name: 'sessions' },   // QR scans
      { name: 'keyEvents' },  // Wadiz pre-order conversions
    ],

    dimensionFilter: {
      andGroup: {
        expressions: [
          {
            filter: {
              fieldName: 'sessionSource',
              stringFilter: {
                matchType: 'EXACT',
                value: 'pulsedrop',
                caseSensitive: false,
              },
            },
          },
          {
            filter: {
              fieldName: 'sessionManualAdContent',
              stringFilter: {
                matchType: 'EXACT',
                value: dropId,
                caseSensitive: true,
              },
            },
          },
        ],
      },
    },
  })

  let scans = 0
  let conversions = 0

  for (const row of response.rows ?? []) {
    scans += parseInt(row.metricValues?.[0]?.value ?? '0', 10)
    conversions += parseInt(row.metricValues?.[1]?.value ?? '0', 10)
  }

  return { scans, conversions }
}
