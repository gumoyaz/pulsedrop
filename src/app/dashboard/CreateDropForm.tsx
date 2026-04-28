'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Crew = { id: string; name: string; location: string }
type Campaign = { id: string; name: string }

export default function CreateDropForm({
  crews,
  campaigns,
}: {
  crews: Crew[]
  campaigns: Campaign[]
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    const form = e.currentTarget
    const data = new FormData(form)

    const res = await fetch('/api/drops', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        crewId: data.get('crewId'),
        campaignId: data.get('campaignId'),
        quantity: data.get('quantity'),
        notes: data.get('notes'),
      }),
    })

    setLoading(false)

    if (!res.ok) {
      const json = await res.json()
      setError(json.error ?? 'Something went wrong')
      return
    }

    setSuccess(true)
    form.reset()
    router.refresh()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-gray-200 p-6 max-w-xl space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            Crew
          </label>
          <select
            name="crewId"
            required
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a crew…</option>
            {crews.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.location}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            Campaign
          </label>
          <select
            name="campaignId"
            required
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a campaign…</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
          Quantity (units)
        </label>
        <input
          name="quantity"
          type="number"
          min="1"
          required
          placeholder="e.g. 24"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
          Notes (optional)
        </label>
        <textarea
          name="notes"
          rows={2}
          placeholder="e.g. 1 pallet, left with captain"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">Drop created — QR code ready below.</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
      >
        {loading ? 'Generating QR…' : 'Create Drop + Generate QR'}
      </button>
    </form>
  )
}
