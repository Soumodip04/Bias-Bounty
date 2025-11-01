"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import marketplace from "@/services/marketplace.service"
import type { SubmissionDoc, SubmissionStatus, FileDoc } from "@/types/marketplace.types"
import { useAuth } from "@/lib/auth-context"
import toast from "react-hot-toast"

export default function MyListingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<SubmissionDoc[]>([])
  const [datasets, setDatasets] = useState<FileDoc[]>([])
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        const [subs, files] = await Promise.all([
          marketplace.getSubmissionsByClient((user as any).id),
          marketplace.getFiles(100),
        ])
        if (!mounted) return
        setItems(subs)
        setDatasets(files)
      } catch (e: any) {
        toast.error(e?.response?.data?.error || e?.message || "Failed to load client submissions")
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [user])

  useEffect(() => {
    if (!user && !loading) router.push("/auth/signin")
  }, [user, loading, router])

  const fileById = useMemo(() => {
    const map = new Map<string, FileDoc>()
    datasets.forEach(f => map.set(f._id, f))
    return map
  }, [datasets])

  const setStatus = async (id: string, status: SubmissionStatus) => {
    try {
      setUpdatingId(id)
      const updated = await marketplace.updateSubmissionStatus(id, status)
      setItems(prev => prev.map(s => s._id === id ? updated : s))
      toast.success(`Marked as ${status}`)
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.message || "Failed to update status")
    } finally {
      setUpdatingId(null)
    }
  }

  const approve = async (s: SubmissionDoc) => {
    // If application phase, approving moves it to in-progress
    // If work was submitted, approving marks it as approved (final)
    const next: SubmissionStatus = s.status === "submitted" ? "approved" : "in-progress"
    await setStatus(s._id, next)
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto p-6 pt-24 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Listings</h1>
          <p className="text-slate-600 mt-1">Manage submissions to your posted datasets.</p>
        </div>

        {loading && <div className="text-slate-500">Loading…</div>}

        {!loading && items.length === 0 && (
          <div className="text-slate-500">No submissions yet.</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(s => {
            const file = fileById.get(s.datasetId)
            return (
              <Card key={s._id} className="border-0 shadow-md bg-white/90">
                <CardHeader>
                  <CardTitle className="line-clamp-1">{file?.title || `Dataset ${s.datasetId}`}</CardTitle>
                  <CardDescription>
                    Worker: <span className="font-medium">{s.workerUsername}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-700">
                  <div>
                    <div className="text-slate-500">Status</div>
                    <div className="font-medium">{s.status}</div>
                  </div>
                  {s.submissionLink && (
                    <div>
                      <div className="text-slate-500">Submission</div>
                      <a className="font-medium text-violet-700 hover:underline break-all" href={s.submissionLink} target="_blank" rel="noreferrer">
                        {s.submissionLink}
                      </a>
                    </div>
                  )}

                  {/* Actions: Only clients can approve/reject here */}
                  <div className="pt-2 flex flex-wrap gap-2">
                    {(s.status === "applied" || s.status === "submitted") && (
                      <>
                        <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => approve(s)} disabled={updatingId === s._id}>
                          {s.status === "submitted" ? "Approve Submission" : "Approve Application"}
                        </Button>
                        <Button variant="destructive" onClick={() => setStatus(s._id, "rejected")} disabled={updatingId === s._id}>
                          {s.status === "submitted" ? "Reject Submission" : "Reject Application"}
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
      <Footer />
    </>
  )
}
