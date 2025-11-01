import { NextRequest, NextResponse } from 'next/server'

// Proxies uploaded file to Python service /analyze-upload and returns real analysis JSON
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as Blob | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Forward to Bias Detection API
    const biasApiUrl = process.env.BIAS_DETECTION_API_URL || 'http://localhost:8000'
    const upstream = new FormData()
    upstream.append('file', file)

    // Increase timeout to 10 minutes for first-time model loading
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 600000) // 10 minutes

    try {
      const res = await fetch(`${biasApiUrl}/analyze-upload`, {
        method: 'POST',
        body: upstream as any,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!res.ok) {
        const msg = await res.text().catch(() => '')
        return NextResponse.json({ error: msg || 'Upstream analysis failed' }, { status: res.status })
      }

      const data = await res.json()
      if (data && typeof data.download_url === 'string' && !data.download_url.startsWith('http')) {
        data.download_url = `${biasApiUrl}${data.download_url}`
      }
      return NextResponse.json(data)
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      if (fetchError.name === 'AbortError') {
        return NextResponse.json({ 
          error: 'Analysis timeout. Backend may be loading AI models (first time takes 5-10 minutes). Please try again in a moment.' 
        }, { status: 504 })
      }
      throw fetchError
    }
  } catch (err) {
    console.error('Analyze API error:', err)
    return NextResponse.json({ error: 'Failed to analyze dataset' }, { status: 500 })
  }
}

// Increase route timeout to 10 minutes
export const maxDuration = 600