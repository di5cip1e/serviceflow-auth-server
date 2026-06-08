import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  const params = await searchParams
  const account = await prisma.account.findUnique({
    where: { email: session.user!.email! },
  })

  const isPro = account?.plan === "pro"
  const trialEndsAt = account?.trialEndsAt
  const trialExpired = trialEndsAt ? new Date() > trialEndsAt : false
  const daysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Billing</h1>

      {params.success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-green-700">
          ✓ Subscription activated! You now have unlimited access.
        </div>
      )}
      {params.canceled && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-yellow-700">
          Checkout canceled. No charges were made.
        </div>
      )}

      {/* Current Status */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Current Plan</h2>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            isPro ? "bg-green-100 text-green-700" : trialExpired ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
          }`}>
            {isPro ? "Pro" : trialExpired ? "Trial Expired" : "Free Trial"}
          </span>
        </div>

        {isPro ? (
          <div>
            <p className="text-gray-600 mb-4">You're on the Pro plan. Unlimited reviews, AI responses, and priority support.</p>
            <a
              href="https://billing.stripe.com/p/login/test"
              target="_blank"
              rel="noopener"
              className="text-sm text-blue-600 hover:underline"
            >
              Manage subscription in Stripe portal →
            </a>
          </div>
        ) : trialExpired ? (
          <div>
            <p className="text-red-600 mb-4">Your 7-day trial has ended. Upgrade to Pro to continue using Review Agent.</p>
            <form action="/api/stripe/checkout" method="POST">
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Subscribe to Pro — $49/month
              </button>
            </form>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-2">
              Your free trial ends in <strong>{daysLeft} day{daysLeft !== 1 ? "s" : ""}</strong>.
            </p>
            <p className="text-gray-500 text-sm mb-4">Upgrade now to make sure you don't lose access.</p>
            <form action="/api/stripe/checkout" method="POST">
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Subscribe to Pro — $49/month
              </button>
            </form>
          </div>
        )}
      </div>

      {/* What's included */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-semibold mb-4">Pro includes:</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>✓ Unlimited review monitoring</li>
          <li>✓ AI-powered response generation</li>
          <li>✓ Google Business Profile integration</li>
          <li>✓ Multiple tone options (professional, friendly, casual)</li>
          <li>✓ Auto-fetch reviews every 15 minutes</li>
          <li>✓ Priority support</li>
        </ul>
        <div className="mt-4 pt-4 border-t">
          <p className="text-2xl font-bold">$49<span className="text-base text-gray-400 font-normal">/month</span></p>
          <p className="text-xs text-gray-400">Cancel anytime</p>
        </div>
      </div>
    </div>
  )
}
