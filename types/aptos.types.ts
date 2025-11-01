// types/aptos.types.ts

export interface IUser {
  userId: string;
  username: string;
  email: string;
  role: string;
  wallet_address: string;
  createdAt?: string;
}

export interface CreateAccountResponse {
  success: boolean;
  message: string;
  user: IUser;
}

export interface GetUserByIdResponse {
  success: boolean;
  message: string;
  user: IUser;
}

export interface TransferResponse {
  success: boolean;
  message: string;
  hash: string;
  explorer: string;
}

export interface CheckBalanceResponse {
  success: boolean;
  address: string;
  balance_octas: number;
  balance_APT: number;
}

export interface RewardResponse {
  success: boolean;
  message: string;
  hash: string;
  explorer: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
}

// Faucet example (for local testing):
// https://faucet.testnet.aptoslabs.com/mint?address=0x63d5abe7eb1499af7707370205958d4ac502158a5592476b67bd29c6e7d1970c&amount=100000000
