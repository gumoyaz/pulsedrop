import { NextRequest, NextResponse } from 'next/server'
import { getDropAnalytics } from '@/lib/analytics'

/**
 * GET /api/analytics?utm_content=<dropId>
 *
 * Returns scan and conversion counts for a single Drop from GA4.
 * Requires GA4_PROPERTY_ID and GOOGLE_SERVICE_ACCOUNT_KEY to be set
 * in the environment before live data is available.
 */
export async function GET(req: NextRequest) {
  const dropId = req.nextUrl.searchParams.get('utm_content')

  if (!dropId) {
    return NextResponse.json(
      { error: 'utm_content query parameter is required' },
      { status: 400 }
    )
  }

  // Guard: return a clear 503 when credentials are not yet configured
  // so the UI can show a "not configured" state rather than a 500 crash.
  if (!process.env.GA4_PROPERTY_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    return NextResponse.json(
      {
        configured: false,
        scans: 0,
        conversions: 0,
        message: 'GA4 credentials not configured — set GA4_PROPERTY_ID and GOOGLE_SERVICE_ACCOUNT_KEY',
      },
      { status: 503 }
    )
  }

  try {
    const { scans, conversions } = await getDropAnalytics(dropId)
    return NextResponse.json({ configured: true, scans, conversions })
  } catch (err) {
    console.error('[/api/analytics] GA4 query error:', err)
    return NextResponse.json(
      { error: 'GA4 query failed — check server logs for details' },
      { status: 500 }
    )
  }
}
