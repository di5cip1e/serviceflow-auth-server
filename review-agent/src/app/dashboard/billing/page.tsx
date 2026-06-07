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

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Billing</h1>

      {params.success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-green-700">
          ✓ Subscription activated! You're now on the Pro plan.
        </div>
      )}
      {params.canceled && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-yellow-700">
          Checkout canceled. No charges were made.
        </div>
      )}

      <div className="bg-white rounded-xl border p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold">
              {isPro ? "Pro Plan" : "Free Plan"}
            </h2>
            <p className="text-gray-500">
              {isPro
                ? "$49/month — Unlimited reviews & AI responses"
                : "Limited to 10 reviews/month"}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            isPro ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
          }`}>
            {isPro ? "Active" : "Free"}
          </span>
        </div>

        {!isPro && (
          <form action="/api/stripe/checkout" method="POST">
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Upgrade to Pro — $49/month
            </button>
          </form>
        )}

        {isPro && (
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              Thank you for being a Pro subscriber!
            </p>
            <a
              href="https://billing.stripe.com/p/login/test"
              target="_blank"
              rel="noopener"
              className="text-sm text-blue-600 hover:underline"
            >
              Manage subscription in Stripe portal →
            </a>
          </div>
        )}
      </div>

      <div className="mt-6 bg-white rounded-xl border p-6">
        <h3 className="font-semibold mb-2">What's included:</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className={isPro ? "text-green-600" : ""}>✓ {isPro ? "Unlimited" : "Up to 10"} reviews per month</li>
          <li>✓ AI-powered response generation</li>
          <li>✓ Google Business Profile integration</li>
          <li>✓ Multiple tone options</li>
          <li className={isPro ? "text-green-600" : "text-gray-400"}>✓ {isPro ? "" : "Pro: "}Priority support</li>
        </ul>
      </div>
    </div>
  )
}
