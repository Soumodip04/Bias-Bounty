"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import marketplace from "@/services/marketplace.service"
import type { SubmissionDoc, FileDoc } from "@/types/marketplace.types"
import { useAuth } from "@/lib/auth-context"
import toast from "react-hot-toast"

export default function MySubmissionsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<SubmissionDoc[]>([])
  const [datasets, setDatasets] = useState<FileDoc[]>([])
  const [submittingId, setSubmittingId] = useState<string | null>(null)
  const [linkInputs, setLinkInputs] = useState<Record<string, { link: string; notes: string }>>({})

  useEffect(() => {
    if (!user) return
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        const [subs, files] = await Promise.all([
          marketplace.getSubmissionsByWorker((user as any).id),
          marketplace.getFiles(100),
        ])
        if (!mounted) return
        setItems(subs)
        setDatasets(files)
      } catch (e: any) {
        toast.error(e?.response?.data?.error || e?.message || "Failed to load submissions")
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

  const submitWork = async (id: string) => {
    const inputs = linkInputs[id] || { link: "", notes: "" }
    if (!inputs.link) {
      toast.error("Please provide a submission link")
      return
    }
    try {
      setSubmittingId(id)
      const updated = await marketplace.submitWork(id, { submissionLink: inputs.link, notes: inputs.notes })
      setItems(prev => prev.map(s => s._id === id ? updated : s))
      toast.success("Work submitted")
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.message || "Failed to submit work")
    } finally {
      setSubmittingId(null)
    }
  }

  const markClaimed = async (id: string) => {
    try {
      setSubmittingId(id)
      const updated = await marketplace.markRewardClaimed(id)
      setItems(prev => prev.map(s => s._id === id ? updated : s))
      toast.success("Reward marked as claimed")
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.message || "Failed to mark reward claimed")
    } finally {
      setSubmittingId(null)
    }
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto p-6 pt-24 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Submissions</h1>
          <p className="text-slate-600 mt-1">Track and manage your applied reviews.</p>
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
                    Status: <span className="font-medium">{s.status}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-700">
                  <div>
                    <div className="text-slate-500">Client</div>
                    <div className="font-medium">{file?.username || s.clientId}</div>
                  </div>
                  {s.submissionLink && (
                    <div>
                      <div className="text-slate-500">Link</div>
                      <a className="font-medium text-violet-700 hover:underline break-all" href={s.submissionLink} target="_blank" rel="noreferrer">
                        {s.submissionLink}
                      </a>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-2 space-y-2">
                    {s.status === "in-progress" && (
                      <div className="space-y-2">
                        <div>
                          <input
                            className="w-full rounded-md border p-2 text-sm"
                            placeholder="Submission link (repo, file, etc.)"
                            value={linkInputs[s._id]?.link || ""}
                            onChange={(e) => setLinkInputs(prev => ({ ...prev, [s._id]: { ...prev[s._id], link: e.target.value } }))}
                          />
                        </div>
                        <div>
                          <textarea
                            className="w-full rounded-md border p-2 text-sm"
                            placeholder="Notes (optional)"
                            value={linkInputs[s._id]?.notes || ""}
                            onChange={(e) => setLinkInputs(prev => ({ ...prev, [s._id]: { ...prev[s._id], notes: e.target.value } }))}
                          />
                        </div>
                        <Button className="bg-violet-600 hover:bg-violet-700 text-white" onClick={() => submitWork(s._id)} disabled={submittingId === s._id}>
                          {submittingId === s._id ? "Submitting…" : "Submit Work"}
                        </Button>
                      </div>
                    )}

                    {s.status === "approved" && !s.rewardClaimed && (
                      <Button variant="outline" onClick={() => markClaimed(s._id)} disabled={submittingId === s._id}>Mark Reward Claimed</Button>
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
