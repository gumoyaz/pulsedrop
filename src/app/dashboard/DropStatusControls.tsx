'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type DropStatus = 'PENDING' | 'DISPATCHED' | 'DELIVERED'

const STEPS: {
  status: DropStatus
  label: string
  activeStyle: string
  ringStyle: string
}[] = [
  {
    status: 'PENDING',
    label: 'Pending',
    activeStyle: 'bg-gray-600 text-white border-gray-600',
    ringStyle: 'hover:bg-gray-50 hover:border-gray-400 text-gray-500',
  },
  {
    status: 'DISPATCHED',
    label: 'Dispatched',
    activeStyle: 'bg-blue-600 text-white border-blue-600',
    ringStyle: 'hover:bg-blue-50 hover:border-blue-400 text-gray-500',
  },
  {
    status: 'DELIVERED',
    label: 'Delivered',
    activeStyle: 'bg-green-600 text-white border-green-600',
    ringStyle: 'hover:bg-green-50 hover:border-green-400 text-gray-500',
  },
]

export default function DropStatusControls({
  dropId,
  currentStatus,
}: {
  dropId: string
  currentStatus: DropStatus
}) {
  const router = useRouter()
  const [status, setStatus] = useState<DropStatus>(currentStatus)
  const [loading, setLoading] = useState(false)

  async function handleStatusChange(next: DropStatus) {
    if (next === status || loading) return
    setLoading(true)

    try {
      const res = await fetch(`/api/drops/${dropId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })

      if (res.ok) {
        setStatus(next)
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`flex rounded-lg overflow-hidden border border-gray-200 text-xs font-medium ${loading ? 'opacity-60 pointer-events-none' : ''}`}>
      {STEPS.map((step, i) => {
        const isActive = status === step.status
        return (
          <button
            key={step.status}
            onClick={() => handleStatusChange(step.status)}
            disabled={loading}
            title={isActive ? `Currently ${step.label}` : `Mark as ${step.label}`}
            className={[
              'flex-1 py-2 transition-colors border-r last:border-r-0 border-gray-200',
              isActive ? step.activeStyle : `bg-white ${step.ringStyle}`,
            ].join(' ')}
          >
            {isActive && loading ? '…' : step.label}
          </button>
        )
      })}
    </div>
  )
}
