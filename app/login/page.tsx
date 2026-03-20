"use client";
import {signIn} from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassworrd] = useState('')
    const [error, setError] = useState('')
    const router = useRouter()

    async function handleLogin(e:React.FormEvent) {
        e.preventDefault()
        const res = await signIn('credentials', {
            email, password, redirect: false,
        })
        if(res?.error) {
            setError('Email atau password salah')
        } else {
            router.push('/dashboard')
        }
    }

    return (
        <div className='min-h-screen flex items-ceter justify-center bg-slate-500'>
            <div className='bg-white p-8 rounded-2xl shadow-sm border w-full max-w-md'>
                <h1 className='text-2xl font-semibold text-slate-800 mb-1'>Istana Group</h1>
                <p className='text-slate-500 text-sm mb-6'>Business Intelligence Dashboard</p>
                <form onSubmit={handleLogin} className='space-y-4'>
                    <div>
                        <label className='text-sm font-medium text-slate-700'>Email</label>
                        <input 
                            type='email'
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className='mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300'
                            placeholder='admin@istana.com'
                        />
                    </div>
                    <div>
                        <label className='text-sm font-medium text-slate-700'>Password</label>
                        <input 
                            type='password'
                            value={password}
                            onChange={e => setPassworrd(e.target.value)}
                            className='mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300'
                            placeholder='••••••••'
                        />
                    </div>
                    {error && <p className='text-red-500 text-sm'>{error}</p>}
                    <button
                        type='submit'
                        className='w-full bg-slate-800 text-white rounded-lg py-2 text-sm font-medium hover:bg-slate-700 transition'
                    >
                        Masuk
                    </button>
                </form>
                <p className='text-xs text-slate-400 mt-4 text-center'>Demo: admin@istana.com / admin123</p>
            </div>
        </div>
    )
}