import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <nav className="flex justify-between items-center p-6 max-w-6xl mx-auto">
        <span className="text-xl font-bold text-gray-900">Review Agent</span>
        <div className="space-x-4">
          <Link href="/login" className="text-gray-600 hover:text-gray-900">Sign in</Link>
          <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Get Started</Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-6">
            🤖 AI-Powered
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Never leave a review unanswered
          </h1>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            Connect your Google Business Profile. We monitor reviews, draft AI responses in your tone, and let you approve before sending. <strong>Respond in seconds, not days.</strong>
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/login" className="px-8 py-3 bg-blue-600 text-white rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors">
              Start Free
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-500">No credit card required</p>
        </div>

        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl border hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-4">🤖</div>
            <h3 className="text-lg font-semibold mb-2">AI-Generated Responses</h3>
            <p className="text-gray-600 leading-relaxed">Our AI drafts personalized responses that match your business tone — professional, friendly, or casual.</p>
          </div>
          <div className="bg-white p-8 rounded-xl border hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-4">✅</div>
            <h3 className="text-lg font-semibold mb-2">You're in Control</h3>
            <p className="text-gray-600 leading-relaxed">Every response is a draft until you approve it. Edit, regenerate, or send as-is.</p>
          </div>
          <div className="bg-white p-8 rounded-xl border hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-lg font-semibold mb-2">Always Monitoring</h3>
            <p className="text-gray-600 leading-relaxed">We check for new reviews every 15 minutes so you never miss customer feedback.</p>
          </div>
        </div>

        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold mb-4">Simple pricing</h2>
          <p className="text-gray-500 mb-8">Start free, upgrade when you need more.</p>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="bg-white border-2 rounded-xl p-8">
              <h3 className="text-lg font-semibold mb-2">Free</h3>
              <div className="text-4xl font-bold mb-4">$0<span className="text-lg text-gray-400">/mo</span></div>
              <ul className="text-left space-y-2 mb-6 text-sm text-gray-600">
                <li>✓ Up to 10 reviews/month</li>
                <li>✓ AI response generation</li>
                <li>✓ Google Business integration</li>
              </ul>
              <Link href="/login" className="block w-full py-2 border-2 border-gray-200 rounded-lg text-center font-medium hover:border-gray-300">
                Get Started
              </Link>
            </div>
            <div className="bg-white border-2 border-blue-600 rounded-xl p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">Popular</div>
              <h3 className="text-lg font-semibold mb-2">Pro</h3>
              <div className="text-4xl font-bold mb-4">$49<span className="text-lg text-gray-400">/mo</span></div>
              <ul className="text-left space-y-2 mb-6 text-sm text-gray-600">
                <li>✓ Unlimited reviews</li>
                <li>✓ AI response generation</li>
                <li>✓ Google Business integration</li>
                <li>✓ Priority support</li>
              </ul>
              <Link href="/login" className="block w-full py-2 bg-blue-600 text-white rounded-lg text-center font-medium hover:bg-blue-700">
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t py-8 text-center text-gray-500 text-sm">
        © 2026 Review Agent. Built by <a href="https://maikr.pro" className="hover:text-gray-700">maikr</a>.
      </footer>
    </div>
  )
}
