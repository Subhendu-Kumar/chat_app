import { z } from "zod";
import { signinSchema, signupSchema } from "@/lib/validations";

export type signupData = Omit<z.infer<typeof signupSchema>, "confirmPassword">;

export type signInData = z.infer<typeof signinSchema>;

export interface AuthContextProps {
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string) => void;
  reload: boolean;
  setReload: (reload: boolean) => void;
  logout: () => void;
  user: UserData | null;
  selectedChat: Chat | null;
  setSelectedChat: (selectedChat: Chat | null) => void;
  chats: Chat[];
  setChats: (chats: Chat[]) => void;
}

export interface UserData {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  avatar: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Chat {
  _id: string;
  chat_name: string;
  is_group_chat: boolean;
  users: User[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}
