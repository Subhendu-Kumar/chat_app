import { BASE_URL } from "@/config";
import { signInData, signUpData } from "@/types";
import axios from "axios";

// const API = axios.create({
//   baseURL: BASE_URL,
// });

//   API.interceptors.request.use((req) => {
//     const token = getToken();
//     if (token) {
//       req.headers.Authorization = `Bearer ${token}`;
//     }
//     return req;
//   });

export const signup = async (data: signUpData) => {
  try {
    const response = axios.post(`${BASE_URL}/signup`, data);
    return response;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
};

export const signin = async (data: signInData) => {
  try {
    const response = axios.post(`${BASE_URL}/signin`, data);
    return response;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
};
