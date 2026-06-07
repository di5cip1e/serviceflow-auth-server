import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  const params = await searchParams
  const account = await prisma.account.findUnique({
    where: { email: session.user!.email! },
    include: { settings: true },
  })

  const googleConnected = !!account?.googleToken

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {params.success === "google_connected" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-green-700">
          ✓ Google Business Profile connected successfully!
        </div>
      )}
      {params.error === "google_auth_failed" && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
          ✗ Google connection failed. Please try again.
        </div>
      )}

      <div className="bg-white rounded-xl border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Connected Accounts</h2>
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="font-medium">Google Business Profile</p>
            <p className="text-sm text-gray-500">
              {googleConnected ? "Connected — reviews will be fetched automatically" : "Not connected"}
            </p>
          </div>
          {googleConnected ? (
            <span className="text-green-600 text-sm font-medium px-3 py-1 bg-green-50 rounded-full">✓ Connected</span>
          ) : (
            <a
              href="/api/google/auth"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 font-medium"
            >
              Connect Google
            </a>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4">Response Preferences</h2>
        <form action="/api/settings" method="POST" className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tone</label>
            <select
              name="tone"
              defaultValue={account?.settings?.tone || "professional"}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
              <option value="casual">Casual</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Signature (optional)</label>
            <input
              type="text"
              name="replySignature"
              defaultValue={account?.settings?.replySignature || ""}
              placeholder="e.g., - The Team at Business Name"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 font-medium"
          >
            Save Settings
          </button>
        </form>
      </div>
    </div>
  )
}
