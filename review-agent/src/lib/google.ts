import { google } from "googleapis"

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXTAUTH_URL}/api/google/callback`
)

export function getAuthUrl() {
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/business.manage"],
    prompt: "consent",
  })
}

export function getOAuthClient() {
  return oauth2Client
}

export async function fetchGoogleReviews(accessToken: string, locationName: string) {
  // Use raw REST to avoid TypeScript type issues with googleapis
  const url = `https://mybusinessbusinessinformation.googleapis.com/v1/${locationName}/reviews?pageSize=50`
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const data = await response.json()
  return data.reviews || []
}
