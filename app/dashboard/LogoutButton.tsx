'use client'

import { signOut } from "next-auth/react"

export default function LogoutButton() {
    return(
        <button
            onClick={()=> signOut({callbackUrl: '/login'})}
            className="cursor-pointer w-full text-left px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition"
        >
            Keluar
        </button>
    )
}