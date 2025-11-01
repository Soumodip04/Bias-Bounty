// services/AptosService.ts
// Use the dedicated Aptos axios instance; configure NEXT_PUBLIC_APTOS_API_BASE_URL for the host
import axiosInstance from "@/utils/axiosInstance2";
import {
  CreateAccountResponse,
  GetUserByIdResponse,
  TransferResponse,
  CheckBalanceResponse,
  RewardResponse,
  ErrorResponse,
} from "@/types/aptos.types";


export interface CreateAccountPayload {
  userId: string;
  username: string;
  email: string;
  role: string;
}

export interface TransferPayload {
  userId: string;
  receiverAddress: string;
  amount: number;
}

export interface RewardPayload {
  receiver: string;
  amount: number;
  reason?: string;
}

/* ------------------------------
   AptosService Class
------------------------------ */
class AptosService {
  private base = "/api/aptos";

  /** 1️⃣ Create new Aptos account */
  async createAccount(
    data: CreateAccountPayload
  ): Promise<CreateAccountResponse | ErrorResponse> {
    try {
      const res = await axiosInstance.post(`${this.base}/create-account`, data);
      return res.data;
    } catch (err: any) {
      return { success: false, error: err.response?.data?.error || err.message };
    }
  }

  /** 2️⃣ Get user details by ID */
  async getUserById(userId: string): Promise<GetUserByIdResponse | ErrorResponse> {
    try {
      const res = await axiosInstance.get(`${this.base}/user/${userId}`);
      return res.data;
    } catch (err: any) {
      return { success: false, error: err.response?.data?.error || err.message };
    }
  }

  /** 3️⃣ Transfer APT between accounts */
  async transferBetweenAccounts(
    data: TransferPayload
  ): Promise<TransferResponse | ErrorResponse> {
    try {
      const res = await axiosInstance.post(`${this.base}/transfer`, data);
      return res.data;
    } catch (err: any) {
      return { success: false, error: err.response?.data?.error || err.message };
    }
  }

  /** 4️⃣ Check APT balance */
  async checkBalance(address: string): Promise<CheckBalanceResponse | ErrorResponse> {
    try {
      const res = await axiosInstance.get(`${this.base}/balance/${address}`);
      return res.data;
    } catch (err: any) {
      return { success: false, error: err.response?.data?.error || err.message };
    }
  }

  /** 5️⃣ Reward transfer (platform → researcher) */
  async transferReward(
    data: RewardPayload
  ): Promise<RewardResponse | ErrorResponse> {
    try {
      const res = await axiosInstance.post(`${this.base}/reward`, data);
      return res.data;
    } catch (err: any) {
      return { success: false, error: err.response?.data?.error || err.message };
    }
  }
}


const aptosService = new AptosService();
export default aptosService;
