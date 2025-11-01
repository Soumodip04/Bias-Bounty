'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Navbar } from '@/components/navbar'
import { useAuth } from '@/lib/auth-context'
import { supabase, uploadDataset } from '@/lib/supabase'
import { formatBytes } from '@/lib/utils'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface UploadedFile {
  file: File
  preview?: string
}

export default function UploadDatasetPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }))
    setFiles(prev => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/plain': ['.txt'],
      'application/x-parquet': ['.parquet'],
    },
    maxSize: 100 * 1024 * 1024, // 100MB
  })

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev]
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!)
      }
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `datasets/${user!.id}/${fileName}`

    const { error } = await supabase.storage
      .from('datasets')
      .upload(filePath, file)

    if (error) {
      throw error
    }

    const { data } = supabase.storage
      .from('datasets')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('Please sign in to upload datasets')
      return
    }

    if (files.length === 0) {
      toast.error('Please select at least one file')
      return
    }

    if (!name.trim() || !description.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      // Upload files to Supabase Storage
      const uploadPromises = files.map(({ file }) => uploadFile(file))
      const fileUrls = await Promise.all(uploadPromises)
      
      setUploadProgress(50)

      // Create dataset record
      const dataset = {
        name: name.trim(),
        description: description.trim(),
        file_url: fileUrls[0], // Primary file URL
        file_type: files[0].file.type,
        file_size: files[0].file.size,
        uploaded_by: user.id,
        status: 'pending' as const,
      }

      console.log(dataset) // Debug log

      const { data, error } = await uploadDataset(dataset)
      
      if (error) {
        throw error
      }

      setUploadProgress(75)

      // Trigger bias analysis with real-time SSE progress
      try {
        const triggerRes = await fetch('/api/analyze-bias', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            datasetId: data.id,
            fileUrl: fileUrls[0],
            fileType: files[0].file.type,
          }),
        })
        const triggerJson = await triggerRes.json()
        const sseUrl = triggerJson.sseUrl as string

        // Open SSE connection to stream progress/logs
        if (sseUrl) {
          setUploadProgress(80)

          const eventSource = new EventSource(sseUrl)

          eventSource.onmessage = async (evt) => {
            try {
              const payload = JSON.parse(evt.data)
              if (payload.type === 'progress' && typeof payload.percent === 'number') {
                setUploadProgress(Math.max(80, Math.min(99, payload.percent)))
              }
              if (payload.type === 'log') {
                // Optionally: surface logs via toast or UI state
                // toast.success(payload.message)
              }
              if (payload.type === 'complete') {
                // Update dataset in DB with results
                await supabase
                  .from('datasets')
                  .update({
                    status: 'completed',
                    bias_score: payload.analysis.bias_score,
                    fairness_metrics: payload.analysis.fairness_metrics,
                  })
                  .eq('id', data.id)

                setUploadProgress(100)
                toast.success('Analysis complete!')

                // Provide improved dataset download via payload.download_url (served by Python service)
                // Persist a link or redirect to dataset details page where user can download
                router.push(`/datasets/${data.id}`)
                eventSource.close()
              }
              if (payload.type === 'error') {
                await supabase
                  .from('datasets')
                  .update({ status: 'failed', fairness_metrics: { error: payload.message } })
                  .eq('id', data.id)
                toast.error('Analysis failed')
                eventSource.close()
              }
            } catch (e) {
              console.error('SSE parse error', e)
            }
          }

          eventSource.onerror = () => {
            // Network/SSE error
            console.error('SSE connection error')
            eventSource.close()
          }
        }
      } catch (analysisError) {
        console.error('Analysis trigger failed:', analysisError)
        // Don't fail the upload if analysis fails to trigger
      }

      // Don't set to 100 here; SSE will do that upon completion
      
      toast.success('Dataset uploaded successfully!')
      // Keep user on page while progress streams; optional redirect handled on complete
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Failed to upload dataset')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>Please sign in to upload datasets</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <Navbar />
      
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Upload Dataset</h1>
              <p className="text-gray-600">
                Upload your dataset for bias analysis and earn points from the community
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Dataset Information */}
              <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Dataset Information</CardTitle>
                  <CardDescription>
                    Provide details about your dataset
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Dataset Name *
                    </label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter dataset name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={uploading}
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      id="description"
                      rows={4}
                      placeholder="Describe your dataset, its purpose, and any relevant context"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      disabled={uploading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* File Upload */}
              <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Upload Files</CardTitle>
                  <CardDescription>
                    Supported formats: CSV, JSON, Excel, TXT, Parquet (max 100MB)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      isDragActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    {isDragActive ? (
                      <p className="text-blue-600">Drop the files here...</p>
                    ) : (
                      <div>
                        <p className="text-gray-600 mb-2">
                          Drag & drop files here, or click to select
                        </p>
                        <p className="text-sm text-gray-500">
                          CSV, JSON, Excel, TXT, Parquet files up to 100MB
                        </p>
                      </div>
                    )}
                  </div>

                  {/* File List */}
                  {files.length > 0 && (
                    <div className="mt-6 space-y-3">
                      <h4 className="font-medium text-gray-900">Selected Files</h4>
                      {files.map((fileObj, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <File className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className="font-medium text-gray-900">{fileObj.file.name}</p>
                              <p className="text-sm text-gray-500">
                                {formatBytes(fileObj.file.size)}
                              </p>
                            </div>
                          </div>
                          {!uploading && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Upload Progress */}
              {uploading && (
                <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          Uploading dataset...
                        </span>
                        <span className="text-sm text-gray-500">{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="w-full" />
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        {uploadProgress < 50 && (
                          <>
                            <Upload className="h-4 w-4" />
                            <span>Uploading files...</span>
                          </>
                        )}
                        {uploadProgress >= 50 && uploadProgress < 75 && (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Creating dataset record...</span>
                          </>
                        )}
                        {uploadProgress >= 75 && (
                          <>
                            <AlertCircle className="h-4 w-4 text-blue-500" />
                            <span>Triggering bias analysis...</span>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={uploading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={uploading || files.length === 0 || !name.trim() || !description.trim()}
                >
                  {uploading ? 'Uploading...' : 'Upload Dataset'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}