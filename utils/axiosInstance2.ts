import axios from "axios";

// Dedicated Axios instance for the Aptos backend
// Use NEXT_PUBLIC_APTOS_API_BASE_URL to override; fallback keeps current remote default
const BASE_URL: string = "https://api.rwinsight.site";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
})

export default axiosInstance;