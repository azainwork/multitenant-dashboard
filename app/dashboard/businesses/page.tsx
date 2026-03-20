'use client'

import { useEffect, useState } from 'react'

const typeLabel: Record<string, string> = {
  FNB: 'Food & Beverage',
  PROPERTY: 'Properti',
  CARWASH: 'Carwash',
  ADVERTISING: 'Advertising',
  TECH: 'Technology',
}

const typeColor: Record<string, string> = {
  FNB: 'bg-orange-50 text-orange-700',
  PROPERTY: 'bg-blue-50 text-blue-700',
  CARWASH: 'bg-cyan-50 text-cyan-700',
  ADVERTISING: 'bg-purple-50 text-purple-700',
  TECH: 'bg-emerald-50 text-emerald-700',
}

const typeIcon: Record<string, string> = {
  FNB: '🍽️',
  PROPERTY: '🏠',
  CARWASH: '🚗',
  ADVERTISING: '📢',
  TECH: '💻',
}

function formatRupiah(n: number) {
  if (n >= 1000000000) return `Rp ${(n / 1000000000).toFixed(1)} M`
  if (n >= 1000000) return `Rp ${(n / 1000000).toFixed(0)} Jt`
  return `Rp ${n.toLocaleString('id-ID')}`
}

export default function BusinessesPage() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch('/api/metrics').then(r => r.json()).then(setData)
  }, [])

  if (!data) return <div className="text-slate-400 text-sm">Memuat data...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Lini Bisnis</h1>
        <p className="text-sm text-slate-500">Performa per unit bisnis Istana Group</p>
      </div>

      {/* Business cards */}
      <div className="grid grid-cols-2 gap-4">
        {data.businessSummary.map((biz: any) => {
          const profit = biz.totalRevenue * 0.4
          const margin = ((profit / biz.totalRevenue) * 100).toFixed(1)

          return (
            <div key={biz.name} className="bg-white rounded-xl border p-5 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl">
                    {typeIcon[biz.type]}
                  </div>
                  <div>
                    <h2 className="font-medium text-slate-800">{biz.name}</h2>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColor[biz.type]}`}>
                      {typeLabel[biz.type]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">Total Revenue</p>
                  <p className="text-sm font-semibold text-slate-800">{formatRupiah(biz.totalRevenue)}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">Est. Profit</p>
                  <p className="text-sm font-semibold text-emerald-600">{formatRupiah(profit)}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">Margin</p>
                  <p className="text-sm font-semibold text-slate-800">{margin}%</p>
                </div>
              </div>

              {/* Customers */}
              <div className="flex items-center justify-between pt-1 border-t">
                <span className="text-xs text-slate-400">Total Pelanggan</span>
                <span className="text-sm font-medium text-slate-700">
                  {biz.totalCustomers.toLocaleString('id-ID')} orang
                </span>
              </div>

              {/* Revenue bar relative to highest */}
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Kontribusi Revenue</span>
                  <span>
                    {((biz.totalRevenue / data.businessSummary.reduce((s: number, b: any) => s + b.totalRevenue, 0)) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{
                      width: `${(biz.totalRevenue / Math.max(...data.businessSummary.map((b: any) => b.totalRevenue))) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h2 className="text-sm font-medium text-slate-700">Ringkasan Semua Bisnis</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              {['Bisnis', 'Tipe', 'Total Revenue', 'Est. Profit', 'Pelanggan', 'Margin'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.businessSummary
              .slice()
              .sort((a: any, b: any) => b.totalRevenue - a.totalRevenue)
              .map((biz: any) => {
                const profit = biz.totalRevenue * 0.4
                const margin = ((profit / biz.totalRevenue) * 100).toFixed(1)
                return (
                  <tr key={biz.name} className="border-b last:border-0 hover:bg-slate-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span>{typeIcon[biz.type]}</span>
                        <span className="font-medium text-slate-800">{biz.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${typeColor[biz.type]}`}>
                        {typeLabel[biz.type]}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">{formatRupiah(biz.totalRevenue)}</td>
                    <td className="px-4 py-3 text-emerald-600 font-medium">{formatRupiah(profit)}</td>
                    <td className="px-4 py-3 text-slate-600">{biz.totalCustomers.toLocaleString('id-ID')}</td>
                    <td className="px-4 py-3 text-slate-600">{margin}%</td>
                  </tr>
                )
              })}
          </tbody>
          {/* Total row */}
          <tfoot className="bg-slate-50 border-t">
            <tr>
              <td colSpan={2} className="px-4 py-3 text-xs font-medium text-slate-500">Total Keseluruhan</td>
              <td className="px-4 py-3 font-semibold text-slate-800">
                {formatRupiah(data.businessSummary.reduce((s: number, b: any) => s + b.totalRevenue, 0))}
              </td>
              <td className="px-4 py-3 font-semibold text-emerald-600">
                {formatRupiah(data.businessSummary.reduce((s: number, b: any) => s + b.totalRevenue * 0.4, 0))}
              </td>
              <td className="px-4 py-3 font-semibold text-slate-800">
                {data.businessSummary.reduce((s: number, b: any) => s + b.totalCustomers, 0).toLocaleString('id-ID')}
              </td>
              <td className="px-4 py-3 font-semibold text-slate-800">~40%</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}