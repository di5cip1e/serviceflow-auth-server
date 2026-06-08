import ReviewCard from "./ReviewCard"

interface Review {
  id: string
  platform: string
  authorName: string
  rating: number
  text: string
  responseText: string | null
  responseSent: boolean
  createdAt: string
  trialExpired?: boolean
}

export default function ReviewList({ reviews }: { reviews: Review[] }) {
  return (
    <div>
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  )
}
