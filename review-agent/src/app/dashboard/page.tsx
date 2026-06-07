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

  return (
    <div>
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
