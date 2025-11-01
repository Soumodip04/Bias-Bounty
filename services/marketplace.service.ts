import axiosInstance from "../utils/axiosInstance";
import {
	CreateFilePayload,
	FileDoc,
	CreateSubmissionPayload,
	SubmissionDoc,
  UpdateSubmissionStatusPayload,
  SubmitWorkPayload,
  SubmissionStatus,
} from "../types/marketplace.types";

class MarketplaceService {
	private http = axiosInstance;

	// Files (datasets)
	async createFile(data: CreateFilePayload): Promise<FileDoc> {
		const res = await this.http.post<FileDoc>("/api/files", data);
		return res.data;
	}

	async getFiles(limit: number): Promise<FileDoc[]> {
		const res = await this.http.get<FileDoc[]>(`/api/files/${limit}`);
		return res.data;
	}

	// Submissions
	async createSubmission(data: CreateSubmissionPayload): Promise<SubmissionDoc> {
		const res = await this.http.post<SubmissionDoc>("/api/submissions", data);
		return res.data;
	}

	// Update submission status by id
	async updateSubmissionStatus(id: string, status: SubmissionStatus): Promise<SubmissionDoc> {
		const payload: UpdateSubmissionStatusPayload = { status };
		const res = await this.http.patch<SubmissionDoc>(`/api/submissions/${id}/status`, payload);
		return res.data;
	}

	// Submit work for a submission id (sets submissionLink, optional notes, and status='submitted')
	async submitWork(id: string, data: SubmitWorkPayload): Promise<SubmissionDoc> {
		const res = await this.http.patch<SubmissionDoc>(`/api/submissions/${id}/submit`, data);
		return res.data;
	}

	// Mark reward claimed for a submission id
	async markRewardClaimed(id: string): Promise<SubmissionDoc> {
		const res = await this.http.patch<SubmissionDoc>(`/api/submissions/${id}/reward-claimed`, {});
		return res.data;
	}

	// List submissions by worker
	async getSubmissionsByWorker(workerId: string): Promise<SubmissionDoc[]> {
		const res = await this.http.get<SubmissionDoc[]>(`/api/submissions/worker/${workerId}`);
		return res.data;
	}

	// List submissions by client
	async getSubmissionsByClient(clientId: string): Promise<SubmissionDoc[]> {
		const res = await this.http.get<SubmissionDoc[]>(`/api/submissions/client/${clientId}`);
		return res.data;
	}
}

export default new MarketplaceService();
export { MarketplaceService };
