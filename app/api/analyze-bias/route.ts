import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// This endpoint triggers analysis and returns the SSE stream URL and job info
export async function POST(request: NextRequest) {
  try {
    const { datasetId, fileUrl, fileType } = await request.json()

    if (!datasetId || !fileUrl) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Update dataset status to analyzing
    await supabase
      .from('datasets')
      .update({ status: 'analyzing' })
      .eq('id', datasetId)

    const biasApiUrl = process.env.BIAS_DETECTION_API_URL || 'http://localhost:8000'

    // Return the SSE URL for the frontend to connect and stream progress
    const sseUrl = `${biasApiUrl}/process-sse?dataset_id=${encodeURIComponent(datasetId)}&file_url=${encodeURIComponent(fileUrl)}&file_type=${encodeURIComponent(fileType || 'text/csv')}`

    return NextResponse.json({
      success: true,
      sseUrl,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}