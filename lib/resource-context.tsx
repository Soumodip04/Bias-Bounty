"use client"

import React, { createContext, useContext, useState, useMemo } from 'react'

export interface FileData {
	userId?: string
	email?: string
	username?: string
	fileName?: string
	fileSize?: number
	type?: string
}

interface ResourceContextValue {
	fileData: FileData | null
	setFileData: (data: FileData | null) => void
}

const ResourceContext = createContext<ResourceContextValue | undefined>(undefined)

export function ResourceProvider({ children }: { children: React.ReactNode }) {
	const [fileData, setFileData] = useState<FileData | null>(null)

	const value = useMemo<ResourceContextValue>(() => ({ fileData, setFileData }), [fileData])

	return (
		<ResourceContext.Provider value={value}>
			{children}
		</ResourceContext.Provider>
	)
}

export function useResource() {
	const ctx = useContext(ResourceContext)
	if (!ctx) throw new Error('useResource must be used within a ResourceProvider')
	return ctx
}

