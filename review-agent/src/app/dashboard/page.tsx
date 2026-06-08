import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import ReviewList from "@/components/ReviewList"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const account = await prisma.account.findUnique({
    where: { email: session!.user!.email! },
    include: {
      reviews: { orderBy: { createdAt: "desc" }, take: 50 },
      settings: true,
    },
  })

  const reviews = account?.reviews ?? []
  const hasGoogle = !!account?.googleToken
  const isPro = account?.plan === "pro"
  const trialEndsAt = account?.trialEndsAt
  const trialExpired = trialEndsAt ? new Date() > trialEndsAt : false
  const daysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  return (
    <div>
      {/* Trial / Subscription Banner */}
      {!isPro && (
        <div className={`rounded-xl p-4 mb-6 ${trialExpired ? "bg-red-50 border border-red-200" : "bg-blue-50 border border-blue-200"}`}>
          {trialExpired ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-800 font-medium">Your trial has expired</p>
                <p className="text-red-600 text-sm">Upgrade to Pro to continue monitoring and responding to reviews.</p>
              </div>
              <a
                href="/dashboard/billing"
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
              >
                Upgrade Now
              </a>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-800 font-medium">🎉 You're on a free trial</p>
                <p className="text-blue-600 text-sm">
                  {daysLeft} day{daysLeft !== 1 ? "s" : ""} remaining. Upgrade anytime to keep access after trial ends.
                </p>
              </div>
              <a
                href="/dashboard/billing"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Upgrade Early
              </a>
            </div>
          )}
        </div>
      )}

      <h1 className="text-2xl font-bold mb-6">Reviews</h1>

      {!hasGoogle && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <p className="text-yellow-800">
            <strong>Get started:</strong> Connect your Google Business Profile in{" "}
            <a href="/dashboard/settings" className="underline">Settings</a> to start monitoring reviews.
          </p>
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-gray-500">No reviews yet. {hasGoogle ? "We'll fetch them automatically." : "Connect your accounts above to get started."}</p>
        </div>
      ) : (
        <ReviewList reviews={reviews.map(r => ({ ...r, createdAt: r.createdAt.toISOString() }))} />
      )}
    </div>
  )
}
