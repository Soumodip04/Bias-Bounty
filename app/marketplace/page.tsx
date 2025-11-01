"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import marketplace from "@/services/marketplace.service"
import type { FileDoc } from "@/types/marketplace.types"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

function formatBytes(bytes?: number) {
	if (!bytes || bytes <= 0) return "-"
	const sizes = ["B", "KB", "MB", "GB", "TB"]
	const i = Math.floor(Math.log(bytes) / Math.log(1024))
	return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}

export default function MarketplacePage() {
	const [items, setItems] = useState<FileDoc[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [applyingId, setApplyingId] = useState<string | null>(null)
	const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set())
	const { user } = useAuth()
	const router = useRouter()

	useEffect(() => {
		let mounted = true
		;(async () => {
			try {
				setLoading(true)
				const data = await marketplace.getFiles(20)
				if (mounted) setItems(data)
			} catch (e: any) {
				if (mounted) setError(e?.message || "Failed to load datasets")
			} finally {
				if (mounted) setLoading(false)
			}
		})()
		return () => {
			mounted = false
		}
	}, [])

		const handleApply = async (dataset: FileDoc) => {
			if (!user) {
				toast.error("Please sign in to apply")
				router.push("/auth/signin")
				return
			}
			if (appliedIds.has(dataset._id)) return
			try {
				setApplyingId(dataset._id)
				await marketplace.createSubmission({
					workerId: (user as any).id,
					workerUsername: (user as any).username || (user as any).email,
					datasetId: dataset._id,
					clientId: dataset.userId,
					status: "applied",
				})
				setAppliedIds(prev => new Set(prev).add(dataset._id))
				toast.success("Applied successfully")
			} catch (e: any) {
				const msg = e?.response?.data?.message || e?.message || "Failed to apply"
				toast.error(msg)
			} finally {
				setApplyingId(null)
			}
		}

		return (
				<>
					<Navbar />
					<div className="max-w-7xl mx-auto p-6 pt-24 space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Expert Marketplace</h1>
				<p className="text-slate-600 mt-1">Browse datasets posted by clients and apply to review them.</p>
			</div>

				{/* Quick navigation for signed-in users */}
				{user && (
					<div className="flex gap-3">
						<Button variant="outline" onClick={() => router.push("/marketplace/submissions")}>My Submissions</Button>
						<Button variant="outline" onClick={() => router.push("/marketplace/listings")}>My Listings</Button>
					</div>
				)}

			{loading && (
				<div className="text-slate-500">Loading datasets…</div>
			)}
			{error && (
				<div className="text-red-600">{error}</div>
			)}

			{!loading && !error && (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{items.map((item) => (
						<Card key={item._id} className="border-0 shadow-md bg-white/90">
							<CardHeader>
								<CardTitle className="line-clamp-1">{item.title}</CardTitle>
								<CardDescription className="line-clamp-2">{item.description || "No description provided."}</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="text-sm text-slate-600 grid grid-cols-2 gap-2">
									<div>
										<div className="text-slate-500">Client</div>
										<div className="font-medium">{item.username}</div>
									</div>
									<div>
										<div className="text-slate-500">Reward</div>
										<div className="font-medium">{item.reward && item.reward > 0 ? `$${item.reward}` : "—"}</div>
									</div>
									<div>
										<div className="text-slate-500">Deadline</div>
										<div className="font-medium">{item.deadline ? new Date(item.deadline).toLocaleDateString() : "—"}</div>
									</div>
									<div>
										<div className="text-slate-500">File</div>
										<div className="font-medium break-all">{item.filename}</div>
									</div>
									<div>
										<div className="text-slate-500">Type</div>
										<div className="font-medium">{item.type}</div>
									</div>
									<div>
										<div className="text-slate-500">Size</div>
										<div className="font-medium">{formatBytes(item.fileSize)}</div>
									</div>
								</div>

								<div className="pt-2 flex justify-end">
													<Button
														className="bg-violet-600 hover:bg-violet-700 text-white"
														onClick={() => handleApply(item)}
														disabled={applyingId === item._id || appliedIds.has(item._id)}
													>
														{appliedIds.has(item._id) ? "Applied" : applyingId === item._id ? "Applying…" : "Apply"}
													</Button>
								</div>
							</CardContent>
						</Card>
					))}
					{items.length === 0 && (
						<div className="col-span-full text-slate-500">No datasets available yet.</div>
					)}
				</div>
					)}
							</div>
							<Footer />
				</>
			)
}

