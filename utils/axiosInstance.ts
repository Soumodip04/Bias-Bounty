import axios from "axios";

// Prefer env-configured API base URL; fall back to local backend
const BASE_URL: string = "https://blog.rwinsight.site";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
})

export default axiosInstance;
