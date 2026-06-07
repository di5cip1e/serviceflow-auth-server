"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"

const nav = [
  { href: "/dashboard", label: "Reviews", icon: "⭐" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
  { href: "/dashboard/billing", label: "Billing", icon: "💳" },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r min-h-screen p-4 flex flex-col">
      <div className="text-xl font-bold mb-8 px-2">Review Agent</div>
      <nav className="space-y-1 flex-1">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-3 py-2 rounded-lg transition-colors ${
              pathname === item.href ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-gray-100"
            }`}
          >
            <span className="mr-2">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      <button
        onClick={() => signOut()}
        className="text-sm text-gray-500 hover:text-gray-700 px-2 py-2 text-left"
      >
        Sign out
      </button>
    </aside>
  )
}
