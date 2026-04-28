'use client'

import { useEffect, useState } from 'react'

interface Props {
  dropId: string
}

interface Analytics {
  configured: boolean
  scans: number
  conversions: number
}

export default function DropAnalytics({ dropId }: Props) {
  const [data, setData] = useState<Analytics | null>(null)

  useEffect(() => {
    fetch(`/api/analytics?utm_content=${dropId}`)
      .then((r) => r.json())
      .then((json) => setData(json))
      .catch(() => setData({ configured: false, scans: 0, conversions: 0 }))
  }, [dropId])

  const scans = data?.configured ? data.scans : '—'
  const conversions = data?.configured ? data.conversions : '—'

  return (
    <div className="grid grid-cols-2 gap-2 mt-1">
      <div className="bg-gray-50 rounded-lg px-3 py-2 text-center">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Scans</p>
        <p className="text-lg font-bold text-gray-900 leading-tight">
          {data === null ? <span className="animate-pulse">…</span> : scans}
        </p>
        <p className="text-xs text-gray-400">QR scans</p>
      </div>
      <div className="bg-gray-50 rounded-lg px-3 py-2 text-center">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Conversions</p>
        <p className="text-lg font-bold text-gray-900 leading-tight">
          {data === null ? <span className="animate-pulse">…</span> : conversions}
        </p>
        <p className="text-xs text-gray-400">Pre-orders</p>
      </div>
    </div>
  )
}
