'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { StringToBoolean } from 'class-variance-authority/types'

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

const schema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  type: z.enum(['FNB', 'PROPERTY', 'CARWASH', 'ADVERTISING', 'TECH'])
})

type FormData = z.infer<typeof schema>

type Business = {
  id: string
  name: string
  type: string
  revenue: {revenue: number; customers: number}[]
}

type ModalMode = 'create' | 'edit' | null

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [metricsData, setMetricsData] = useState<any>(null)
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [editTarget, setEditTarget] = useState<Business | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Business | null>(null)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const [bizRes, metRes] = await Promise.all([
      fetch('/api/businesses').then(r => r.json()),
      fetch('/api/metrics').then(r => r.json()),
    ])
    setBusinesses(bizRes)
    setMetricsData(metRes)
  }

  function openCreate() {
    reset({name:'', type:'FNB'})
    setEditTarget(null)
    setModalMode('create')
  }

  function openEdit(biz:Business) {
    setEditTarget(biz)
    setValue('name',biz.name)
    setValue('type', biz.type as any)
    setModalMode('edit')
  }

  function closeModal() {
    setModalMode(null)
    setEditTarget(null)
    reset()
  }

  async function onSubmit(data: FormData) {
    setLoading(true)
    if(modalMode === 'create') {
      await fetch('/api/businesses', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(data),
      })
    } else if (modalMode === 'edit' && editTarget) {
      await fetch('/api/businesses/${editTarget.id}', {
        method: 'PATCH',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(data),
      })
    }
    await loadData()
    setLoading(false)
    closeModal()
  }

  async function confirmDelete() {
    if(!deleteTarget) return
    setLoading(true)
    await fetch('/api/businesses/${deleteTarget.id}',{method: 'DELETE'})
    await loadData()
    setLoading(false)
    setDeleteTarget(null)
  }

  const totalAllRevenue = businesses.reduce((s,b) => s + b.revenue.reduce((rs, r) => rs + r.revenue, 0), 0)

  return (
    <div className="space-y-6">
      <div className='flex items-center justify-between'>
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Lini Bisnis</h1>
          <p className="text-sm text-slate-500">Performa per unit bisnis Istana Group</p>
        </div>

        <button onClick={openCreate}
          className='bg-slate-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-slate-700 transition'
        >+ Tambah Bisnis</button>
      </div>

      {/* Business cards */}
      <div className="grid grid-cols-2 gap-4">
        {businesses.map(biz => {
          const totalRevenue = biz.revenue.reduce((s, r) => s + r.revenue, 0)
          const totalCustomers = biz.revenue.reduce((s, r) => s+r.customers, 0)
          const profit = totalRevenue * 0.4
          const margin = totalRevenue > 0 ? ((profit/totalRevenue) * 100).toFixed(1) : '0'
          const contribution = totalAllRevenue > 0 ? ((totalRevenue / totalAllRevenue) * 100).toFixed(1) : '0'
          
          return (
              <div key={biz.id} className="bg-white rounded-xl border p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl">
                      {typeIcon[biz.type]}
                    </div>
                    <div>
                      <h2 className="font-medium text-slate-800">{biz.name}</h2>
                      <span className="{`text-xs px-2 py-0.5 ruonded-full font-medium ${typeColor[biz.type]}`}">
                        {typeLabel[biz.type]}
                      </span>
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className='flex gap-2'>
                    <button onClick={() => openEdit(biz)}
                        className='text-xs text-slate-500 px-2.5 py-1 rounded-lg hover:bg-slate-50 transition'
                      >
                        Edit
                      </button>

                    <button onClick={() => setDeleteTarget(biz)}
                      className="text-xs text-red-500 border border-red-100 px-2.5 py-1 rounded-lg hover:bg-red-50 transition">
                      Hapus
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-400 mb-1">Total Revenue</p>
                    <p className="text-sm font-semibold text-slate-800">{formatRupiah(totalRevenue)}</p>
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

                <div className="flex items-center justify-between pt-1 border-t">
                  <span className="text-xs text-slate-400">Total Pelanggan</span>
                  <span className="text-sm font-medium text-slate-700">
                    {totalCustomers.toLocaleString('id-ID')} orang
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Kontribusi Revenue</span>
                    <span>{contribution}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full transition-all"
                      style={{ width: `${contribution}%` }} />
                  </div>
                </div>

              </div>
          )
        })}

        {businesses.length === 0 && (
          <div className="col-span-2 bg-white rounded-xl border p-12 text-center">
            <p className="text-slate-400 text-sm mb-3">Belum ada lini bisnis</p>
            <button onClick={openCreate}
              className="text-sm text-indigo-600 hover:underline">
              + Tambah bisnis pertama
            </button>
          </div>
        )}
      </div>

      {businesses.length > 0 && (
        <div className='bg-white rounded-xl border overflow-hidden'>
          <div className='px-5 py-4 border-b'>
            <h2 className='text-sm font-medium text-slate-700'>Ringkasan Semua Bisnis</h2>
          </div>
          <table className='w-full text-sm'>
            <thead className='bg-slate-50 border-b'></thead>
            <tbody>
              {businesses
                .map(biz => ({
                  ...biz,
                  totalRevenue: biz.revenue.reduce((s, r) => s + r.revenue, 0),
                  totalCustomers: biz.revenue.reduce((s, r) => s + r.customers, 0),
                }))
                .sort((a, b) => b.totalRevenue - a.totalRevenue)
                .map(biz => {
                  const profit = biz.totalRevenue * 0.4
                  const margin = biz.totalRevenue > 0
                    ? ((profit / biz.totalRevenue) * 100).toFixed(1)
                    : '0'
                    return (
                      <tr key={biz.id} className="border-b last:border-0 hover:bg-slate-50 transition">
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

            <tfoot className="bg-slate-50 border-t">
              <tr>
                <td colSpan={2} className="px-4 py-3 text-xs font-medium text-slate-500">Total</td>
                <td className="px-4 py-3 font-semibold text-slate-800">{formatRupiah(totalAllRevenue)}</td>
                <td className="px-4 py-3 font-semibold text-emerald-600">{formatRupiah(totalAllRevenue * 0.4)}</td>
                <td className="px-4 py-3 font-semibold text-slate-800">
                  {businesses.reduce((s, b) => s + b.revenue.reduce((rs, r) => rs + r.customers, 0), 0).toLocaleString('id-ID')}
                </td>
                <td className="px-4 py-3 font-semibold text-slate-800">~40%</td>
              </tr>
            </tfoot>
          </table>
          
        </div>
      )}

      {modalMode && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-5">
              {modalMode === 'create' ? 'Tambah Lini Bisnis' : 'Edit Lini Bisnis'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Nama Bisnis</label>
                <input {...register('name')}
                  placeholder="contoh: Istana Café Bandung"
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Tipe Bisnis</label>
                <select {...register('type')}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 bg-white">
                  {Object.entries(typeLabel).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
                {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
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
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Hapus Bisnis?</h2>
            <p className="text-sm text-slate-500 mb-5">
              <span className="font-medium text-slate-700">{deleteTarget.name}</span> dan semua data metrik terkait akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.
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