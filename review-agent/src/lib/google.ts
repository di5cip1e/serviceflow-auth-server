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
  oauth2Client.setCredentials({ access_token: accessToken })
  const mybusiness = google.mybusinessbusinessinformation({
    version: "v1",
    auth: oauth2Client,
  })

  const response = await mybusiness.accounts.locations.reviews.list({
    parent: locationName,
    pageSize: 50,
  })

  return response.data.reviews || []
}
