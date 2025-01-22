import axios from "axios";
import { BASE_URL } from "@/config";
import { getToken } from "@/lib/utils";
import { signInData, signupData } from "@/types";

const API = axios.create({
  baseURL: BASE_URL,
});

API.interceptors.request.use((req) => {
  const token = getToken();
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const signup = async (data: signupData) => {
  try {
    const response = await axios.post(`${BASE_URL}/signup`, data);
    return response;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
};

export const signin = async (data: signInData) => {
  try {
    const response = await axios.post(`${BASE_URL}/signin`, data);
    return response;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
};

export const searchUsers = async (query: string) => {
  try {
    const response = await API.get(`/users?search=${query}`);
    return response;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
};

export const accessChat = async (userId: string | undefined) => {
  try {
    const response = await API.post("/chat/access", { userId });
    return response;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
};

export const fetchAllChat = async () => {
  try {
    const response = await API.get("/chat/fetch");
    return response;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
};

export const createGroup = async (chat_name: string, users: string[]) => {
  try {
    const response = await API.post("/chat/group/create", { chat_name, users });
    return response;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
};

export const updateGroup = async (
  chat_id: string,
  chat_name: string,
  users: string[]
) => {
  try {
    const response = await API.put("/chat/group/update", {
      chat_id,
      chat_name,
      users,
    });
    return response;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
};

export const messageSend = async (content: string, chat_id: string) => {
  try {
    const response = await API.post("/chat/message/send", { content, chat_id });
    return response;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
};

export const messageFetch = async (chat_id: string) => {
  try {
    const response = await API.get(`/chat/message/fetch/${chat_id}`);
    return response;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
};
