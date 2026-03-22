'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const statusColor: Record<string, string> = {
  COMPLETED: 'bg-emerald-50 text-emerald-700',
  PENDING: 'bg-amber-50 text-amber-700',
  FAILED: 'bg-red-50 text-red-700',
}

const statusLabel: Record<string, string> = {
  COMPLETED: 'Selesai',
  PENDING: 'Pending',
  FAILED: 'Gagal',
}

const typeLabel: Record<string, string> = {
  INCOME: 'Pemasukan',
  EXPENSE: 'Pengeluaran',
}

const bizIcon: Record<string, string> = {
  FNB: '🍽️',
  PROPERTY: '🏠',
  CARWASH: '🚗',
  ADVERTISING: '📢',
  TECH: '💻',
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    maximumFractionDigits: 0 
  }).format(n)
}

const schema = z.object({
  businessId: z.string().min(1, 'Pilih bisnis'),
  description: z.string().min(3, 'Deskripsi minimal 3 karakter'),
  amount: z.string().min(1, 'Masukkan jumlah').refine(v => !isNaN(parseFloat(v)) && parseFloat(v) > 0, 'Jumlah harus lebih dari 0'),
  type: z.enum(['INCOME','EXPENSE']),
  status: z.enum(['COMPLETED','PENDING','FAILED'])
})

type FormData = z.infer<typeof schema>
type ModalMode = 'create' | 'edit' | null

type Transaction = {
  id: string
  businessId: string
  description: string
  amount: number
  type: string
  status: string
  createdAt: string
}

type Business = {
  id: string
  name: string
  type: string
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [editTarget, setEditTarget] = useState<Transaction | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(false)
  
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterBiz, setFilterBiz] = useState('')

  const { register, handleSubmit, reset, setValue, formState: {errors} } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {type: 'INCOME', status: 'COMPLETED'}
  })

  useEffect(() => {
    loadBusinesses()
    loadTransactions()
  }, [filterType, filterStatus, filterBiz])

  async function loadBusinesses() {
    const data = await fetch('/api/businesses').then(r => r.json())
    setBusinesses(data)
  }

  async function loadTransactions() {
    const params = new URLSearchParams()
    if (filterType) params.set('type', filterType)
    if (filterStatus) params.set('status', filterStatus)
    if (filterBiz) params.set('businessId', filterBiz)
    const data = await fetch(`/api/transactions?${params}`).then(r => r.json())
    setTransactions(data)
  }

  function openCreate() {
    reset({ type: 'INCOME', status: 'COMPLETED', businessId: '', description: '', amount: '' })
    setEditTarget(null)
    setModalMode('create')
  }

  function openEdit(tx: Transaction) {
    setEditTarget(tx)
    setValue('businessId', tx.businessId)
    setValue('description', tx.description)
    setValue('amount', String(tx.amount))
    setValue('type', tx.type as any)
    setValue('status', tx.status as any)
    setModalMode('edit')
  }

  function closeModal() {
    setModalMode(null)
    setEditTarget(null)
    reset()
  }

  async function onSubmit(data: FormData) {
    setLoading(true)
    if (modalMode === 'create') {
      await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    } else if (modalMode === 'edit' && editTarget) {
      await fetch(`/api/transactions/${editTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    }
    await loadTransactions()
    setLoading(false)
    closeModal()
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setLoading(true)
    await fetch(`/api/transactions/${deleteTarget.id}`, { method: 'DELETE' })
    await loadTransactions()
    setLoading(false)
    setDeleteTarget(null)
  }

  const totalIncome = transactions
    .filter(t => t.type === 'INCOME' && t.status === 'COMPLETED')
    .reduce((s, t) => s + t.amount, 0)

  const totalExpense = transactions
    .filter(t => t.type === 'EXPENSE' && t.status === 'COMPLETED')
    .reduce((s, t) => s + t.amount, 0)

  const totalPending = transactions
    .filter(t => t.status === 'PENDING')
    .reduce((s, t) => s + t.amount, 0)

  function getBizName(businessId: string) {
    return businesses.find(b => b.id === businessId)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Transaksi</h1>
          <p className="text-sm text-slate-500">{transactions.length} transaksi ditemukan</p>
        </div>
        <button onClick={openCreate}
          className="bg-slate-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-slate-700 transition">
          + Tambah Transaksi
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-5">
          <p className="text-xs text-slate-500 mb-1">Total Pemasukan</p>
          <p className="text-xl font-semibold text-emerald-600">{formatRupiah(totalIncome)}</p>
          <p className="text-xs text-slate-400 mt-1">transaksi selesai</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-xs text-slate-500 mb-1">Total Pengeluaran</p>
          <p className="text-xl font-semibold text-red-500">{formatRupiah(totalExpense)}</p>
          <p className="text-xs text-slate-400 mt-1">transaksi selesai</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-xs text-slate-500 mb-1">Total Pending</p>
          <p className="text-xl font-semibold text-amber-500">{formatRupiah(totalPending)}</p>
          <p className="text-xs text-slate-400 mt-1">menunggu konfirmasi</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-4 flex gap-3 flex-wrap">
        <select value={filterBiz} onChange={e => setFilterBiz(e.target.value)}
          className="text-sm border rounded-lg px-3 py-2 text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-200 bg-white">
          <option value="">Semua Bisnis</option>
          {businesses.map(b => (
            <option key={b.id} value={b.id}>{bizIcon[b.type]} {b.name}</option>
          ))}
        </select>

        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="text-sm border rounded-lg px-3 py-2 text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-200 bg-white">
          <option value="">Semua Tipe</option>
          <option value="INCOME">Pemasukan</option>
          <option value="EXPENSE">Pengeluaran</option>
        </select>

        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="text-sm border rounded-lg px-3 py-2 text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-200 bg-white">
          <option value="">Semua Status</option>
          <option value="COMPLETED">Selesai</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Gagal</option>
        </select>
        {(filterType || filterStatus || filterBiz) && (
          <button onClick={() => { setFilterType(''); setFilterStatus(''); setFilterBiz('') }}
            className="text-sm text-slate-400 hover:text-red-500 transition px-2">
            ✕ Reset filter
          </button>
        )}

      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              {['Deskripsi', 'Bisnis', 'Jumlah', 'Tipe', 'Status', 'Tanggal', 'Aksi'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-400 text-sm">
                  Tidak ada transaksi ditemukan
                </td>
              </tr>
            ) : (
              transactions.map(tx => {
                const biz = getBizName(tx.businessId)
                return (
                  <tr key={tx.id} className="border-b last:border-0 hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-slate-700 font-medium max-w-48 truncate">
                      {tx.description}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {biz ? `${bizIcon[biz.type]} ${biz.name}` : '-'}
                    </td>
                    <td className={`px-4 py-3 font-medium ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-red-500'}`}>
                      {tx.type === 'INCOME' ? '+' : '-'}{formatRupiah(tx.amount)}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{typeLabel[tx.type]}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[tx.status]}`}>
                        {statusLabel[tx.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {new Date(tx.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(tx)}
                          className="text-xs text-slate-500 border px-2.5 py-1 rounded-lg hover:bg-slate-50 transition">
                          Edit
                        </button>
                        <button onClick={() => setDeleteTarget(tx)}
                          className="text-xs text-red-500 border border-red-100 px-2.5 py-1 rounded-lg hover:bg-red-50 transition">
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

            {modalMode && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-5">
              {modalMode === 'create' ? 'Tambah Transaksi' : 'Edit Transaksi'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              <div>
                <label className="text-sm font-medium text-slate-700">Bisnis</label>
                <select {...register('businessId')}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 bg-white">
                  <option value="">-- Pilih bisnis --</option>
                  {businesses.map(b => (
                    <option key={b.id} value={b.id}>{bizIcon[b.type]} {b.name}</option>
                  ))}
                </select>
                {errors.businessId && <p className="text-red-500 text-xs mt-1">{errors.businessId.message}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Deskripsi</label>
                <input {...register('description')}
                  placeholder="contoh: Penjualan bulan Juli"
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Jumlah (Rp)</label>
                <input {...register('amount')} type="number" min="0"
                  placeholder="contoh: 5000000"
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
                {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700">Tipe</label>
                  <select {...register('type')}
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 bg-white">
                    <option value="INCOME">Pemasukan</option>
                    <option value="EXPENSE">Pengeluaran</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Status</label>
                  <select {...register('status')}
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 bg-white">
                    <option value="COMPLETED">Selesai</option>
                    <option value="PENDING">Pending</option>
                    <option value="FAILED">Gagal</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal}
                  className="flex-1 border rounded-lg py-2 text-sm text-slate-600 hover:bg-slate-50 transition">
                  Batal
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 bg-slate-800 text-white rounded-lg py-2 text-sm font-medium hover:bg-slate-700 transition disabled:opacity-40">
                  {loading ? 'Menyimpan...' : modalMode === 'create' ? 'Tambah' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

            {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-6">
            <div className="text-3xl mb-3">⚠️</div>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Hapus Transaksi?</h2>
            <p className="text-sm text-slate-500 mb-1">
              Transaksi berikut akan dihapus permanen:
            </p>
            <p className="text-sm font-medium text-slate-700 bg-slate-50 rounded-lg px-3 py-2 mb-5">
              {deleteTarget.description} — {formatRupiah(deleteTarget.amount)}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 border rounded-lg py-2 text-sm text-slate-600 hover:bg-slate-50 transition">
                Batal
              </button>
              <button onClick={confirmDelete} disabled={loading}
                className="flex-1 bg-red-500 text-white rounded-lg py-2 text-sm font-medium hover:bg-red-600 transition disabled:opacity-40">
                {loading ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}