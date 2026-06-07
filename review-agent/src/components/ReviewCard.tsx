"use client"
import { useState } from "react"

interface Review {
  id: string
  platform: string
  authorName: string
  rating: number
  text: string
  responseText: string | null
  responseSent: boolean
  createdAt: string
}

export default function ReviewCard({ review }: { review: Review }) {
  const [responding, setResponding] = useState(false)
  const [response, setResponse] = useState(review.responseText || "")
  const [saving, setSaving] = useState(false)
  const [sent, setSent] = useState(review.responseSent)

  const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating)

  const generateResponse = async () => {
    setResponding(true)
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId: review.id, text: review.text, rating: review.rating }),
      })
      const data = await res.json()
      if (data.responseText) setResponse(data.responseText)
    } catch (err) {
      console.error("Failed to generate:", err)
    }
    setResponding(false)
  }

  const sendResponse = async () => {
    if (!response.trim()) return
    setSaving(true)
    try {
      const res = await fetch("/api/reviews/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId: review.id, response }),
      })
      if (res.ok) setSent(true)
    } catch (err) {
      console.error("Failed to send:", err)
    }
    setSaving(false)
  }

  return (
    <div className="bg-white rounded-xl border p-6 mb-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-yellow-500 text-lg">{stars}</span>
          <span className="ml-2 text-sm text-gray-600 font-medium">{review.authorName}</span>
          <span className={`ml-2 text-xs px-2 py-0.5 rounded font-medium ${
            review.platform === "google" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"
          }`}>
            {review.platform}
          </span>
        </div>
        <span className="text-xs text-gray-400">
          {new Date(review.createdAt).toLocaleDateString()}
        </span>
      </div>
      <p className="text-gray-700 mb-4 leading-relaxed">{review.text}</p>

      {sent ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700 font-medium mb-1">✓ Response sent</p>
          <p className="text-gray-600 text-sm">{response}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {response ? (
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              className="w-full p-3 border rounded-lg text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="AI-generated response will appear here..."
            />
          ) : null}
          <div className="flex gap-2">
            <button
              onClick={generateResponse}
              disabled={responding}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50 font-medium"
            >
              {responding ? "Generating..." : response ? "Regenerate" : "✨ AI Generate"}
            </button>
            {response && (
              <button
                onClick={sendResponse}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 font-medium"
              >
                {saving ? "Sending..." : "✓ Approve & Send"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
