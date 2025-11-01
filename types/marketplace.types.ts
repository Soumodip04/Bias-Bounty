// File (dataset) related payloads and docs
export interface CreateFilePayload {
	userId: string
	email: string
	username: string
	title: string
	description?: string
	filename: string
	fileSize: number
	type: string
	reward?: number
	deadline?: string | Date
}

export interface FileDoc {
	_id: string
	userId: string
	email: string
	username: string
	title: string
	description?: string
	filename: string
	fileSize: number
	type: string
	reward?: number
	deadline?: string
	createdAt: string
	updatedAt: string
}

// Submission related payloads and docs
export interface CreateSubmissionPayload {
	workerId: string
	workerUsername: string
	datasetId: string
	clientId: string
	status?: "applied" | "in-progress" | "submitted" | "approved" | "rejected"
	submissionLink?: string
	notes?: string
	rewardClaimed?: boolean
	approvedAt?: string | Date
}

export interface SubmissionDoc {
	_id: string
	workerId: string
	workerUsername: string
	datasetId: string
	clientId: string
	status: "applied" | "in-progress" | "submitted" | "approved" | "rejected"
	submissionLink?: string
	notes?: string
	rewardClaimed: boolean
	approvedAt?: string
	createdAt: string
	updatedAt: string
}

// Additional actions on submissions
export type SubmissionStatus = "applied" | "in-progress" | "submitted" | "approved" | "rejected";

export interface UpdateSubmissionStatusPayload {
	status: SubmissionStatus
}

export interface SubmitWorkPayload {
	submissionLink: string
	notes?: string
}
