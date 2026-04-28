import { prisma } from '@/lib/prisma'
import CreateDropForm from './dashboard/CreateDropForm'
import DropStatusControls from './dashboard/DropStatusControls'
import DropAnalytics from './dashboard/DropAnalytics'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [crews, campaigns, drops] = await Promise.all([
    prisma.crew.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.campaign.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.drop.findMany({
      include: { crew: true, campaign: true },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">PD</span>
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-900 leading-none">PulseDrop</h1>
          <p className="text-xs text-gray-500">Logistics &amp; Conversion Tracker</p>
        </div>
        <div className="ml-auto flex gap-6 text-sm text-gray-500">
          <span><strong className="text-gray-900">{crews.length}</strong> Crews</span>
          <span><strong className="text-gray-900">{campaigns.length}</strong> Campaigns</span>
          <span><strong className="text-gray-900">{drops.length}</strong> Drops</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-10 space-y-12">

        {/* ── Crews ── */}
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3">Community Crews</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {crews.length === 0 ? (
              <p className="px-4 py-6 text-sm text-gray-400 text-center">No crews yet — run the seed script or add one.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Crew Name', 'Location', 'Captain', 'Contact'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {crews.map((crew) => (
                    <tr key={crew.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{crew.name}</td>
                      <td className="px-4 py-3 text-gray-600">{crew.location}</td>
                      <td className="px-4 py-3 text-gray-600">{crew.captainName}</td>
                      <td className="px-4 py-3 text-gray-500">{crew.captainContact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* ── Campaigns ── */}
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3">Campaigns</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {campaigns.length === 0 ? (
              <p className="px-4 py-6 text-sm text-gray-400 text-center">No campaigns yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Campaign Name', 'Wadiz Base URL', 'Start', 'End'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {campaigns.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                      <td className="px-4 py-3">
                        <a
                          href={c.wadizBaseUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline truncate max-w-xs block"
                        >
                          {c.wadizBaseUrl}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {c.startDate ? new Date(c.startDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {c.endDate ? new Date(c.endDate).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* ── Create Drop ── */}
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3">Create New Drop</h2>
          {crews.length === 0 || campaigns.length === 0 ? (
            <p className="text-sm text-gray-400">Add at least one crew and one campaign first.</p>
          ) : (
            <CreateDropForm crews={crews} campaigns={campaigns} />
          )}
        </section>

        {/* ── Drops ── */}
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            Drops{' '}
            <span className="text-gray-400 font-normal text-sm">({drops.length})</span>
          </h2>
          {drops.length === 0 ? (
            <p className="text-sm text-gray-400">No drops yet. Create one above.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {drops.map((drop) => (
                <div
                  key={drop.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col"
                >
                  {/* QR Code */}
                  {drop.qrCodePath ? (
                    <div className="bg-white flex items-center justify-center p-4 border-b border-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={drop.qrCodePath}
                        alt={`QR code for drop ${drop.id}`}
                        className="w-40 h-40"
                      />
                    </div>
                  ) : (
                    <div className="h-40 bg-gray-50 flex items-center justify-center border-b border-gray-100">
                      <span className="text-gray-300 text-sm">No QR yet</span>
                    </div>
                  )}

                  {/* Card Body */}
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <DropStatusControls
                      dropId={drop.id}
                      currentStatus={drop.status as 'PENDING' | 'DISPATCHED' | 'DELIVERED'}
                    />

                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-400">
                        {drop.dispatchedAt
                          ? `Dispatched ${new Date(drop.dispatchedAt).toLocaleDateString()}`
                          : drop.status === 'PENDING'
                          ? 'Not yet dispatched'
                          : null}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(drop.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="font-semibold text-gray-900 text-sm">{drop.crew.name}</p>
                    <p className="text-xs text-gray-500">{drop.campaign.name}</p>
                    <p className="text-xs text-gray-500">Qty: <strong>{drop.quantity}</strong> units</p>

                    {drop.notes && (
                      <p className="text-xs text-gray-400 italic">{drop.notes}</p>
                    )}

                    <DropAnalytics dropId={drop.id} />

                    {/* UTM URL */}
                    <div className="mt-auto pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-400 mb-1 font-medium">Tracking URL</p>
                      <p className="text-xs text-gray-500 break-all leading-relaxed">
                        {drop.utmUrl || '—'}
                      </p>
                    </div>

                    {/* Download QR */}
                    {drop.qrCodePath && (
                      <a
                        href={drop.qrCodePath}
                        download={`qr-${drop.crew.name.replace(/\s+/g, '-')}-${drop.id.slice(0, 6)}.png`}
                        className="mt-2 text-center text-xs text-blue-600 hover:text-blue-700 font-medium py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        Download QR
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
