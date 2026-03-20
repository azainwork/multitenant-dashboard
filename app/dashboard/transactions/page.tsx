'use client'

import { useEffect, useState } from 'react'

const statusColor: Record<string, string> = {
  COMPLETED: 'bg-emerald-50 text-emerald-700',
  PENDING: 'bg-amber-50 text-amber-700',
  FAILED: 'bg-red-50 text-red-700',
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

export default function TransactionsPage() {
  const [txs, setTxs] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/transactions').then(r => r.json()).then(setTxs)
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Transaksi</h1>
        <p className="text-sm text-slate-500">10 transaksi terakhir</p>
      </div>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              {['Deskripsi', 'Jumlah', 'Tipe', 'Status', 'Tanggal'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {txs.map(tx => (
              <tr key={tx.id} className="border-b last:border-0 hover:bg-slate-50 transition">
                <td className="px-4 py-3 text-slate-700">{tx.description}</td>
                <td className={`px-4 py-3 font-medium ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {tx.type === 'INCOME' ? '+' : '-'}{formatRupiah(tx.amount)}
                </td>
                <td className="px-4 py-3 text-slate-500">{tx.type}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[tx.status]}`}>
                    {tx.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {new Date(tx.createdAt).toLocaleDateString('id-ID')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}