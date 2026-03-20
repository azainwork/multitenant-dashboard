import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import Link from 'next/link'
import React from "react"
import LogoutButton from "./LogoutButton"

export default async function DashboardLayout({children}:{ children: React.ReactNode}) {
    const session = await getServerSession()
    if (!session) redirect('/login')
    
    return (
        <div className="flex min-h-screen bg-slate-50">
            <aside className="w-60 bg-white border-r px-4 py-6 flex flex-col gap-1">
                <div className="mb-6 px-2">
                    <h2 className="font-semibold text-slate-800">Istana Group</h2>
                    <p className="text-xs text-slate-400">Holding Dashboard</p>
                </div>

                <div className="flex flex-col gap-1 flex-1">
                    {[
                        { href: '/dashboard', label: '📊 Overview' },
                        { href: '/dashboard/businesses', label: '🏢 Bisnis' },
                        { href: '/dashboard/transactions', label: '💳 Transaksi' },
                    ].map(item => (
                        <Link key={item.href} href={item.href}
                        className="px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition">
                        {item.label}
                        </Link>
                    ))}
                </div>

                <div className="border-t pt-4 mt-4 cursor-pointer">
                    <p className="text-xs text-slate-500 px-2 mb-1 truncate">{session.user?.email}</p>
                    <LogoutButton />
                </div>

            </aside>
            <main className='flex-1 p-8 overflow-auto'>{children}</main>
        </div>
    )
}
