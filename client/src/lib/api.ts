import axios from "axios";

// export const apiLink = (import.meta.env.VITE_ENV === "DEV" 
//   ? import.meta.env.VITE_DEV_API_URL 
//   : import.meta.env.VITE_PROD_API_URL) as string;
export const apiLink = "https://iiti-rnd.onrender.com"


export const api = axios.create({
  baseURL: apiLink,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});