import axios from "axios";
import { readItem } from "../helpers/local_storage";

export const authHeader = () => {
  const token = readItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const handleError = <T>(e: unknown, fallback: string): { success: boolean; message: string; data?: T } => ({
  success: false,
  message: axios.isAxiosError(e) ? (e.response?.data as { message?: string })?.message ?? fallback : fallback,
});
