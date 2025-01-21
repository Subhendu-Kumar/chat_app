import { z } from "zod";
import { signinSchema, signupSchema } from "@/lib/validations";

export type signupData = Omit<z.infer<typeof signupSchema>, "confirmPassword">;

export type signInData = z.infer<typeof signinSchema>;

export interface AuthContextProps {
  chats: Chat[];
  reload: boolean;
  loading: boolean;
  logout: () => void;
  user: UserData | null;
  isAuthenticated: boolean;
  selectedChat: Chat | null;
  login: (token: string) => void;
  setChats: (chats: Chat[]) => void;
  setReload: (reload: boolean) => void;
  setSelectedChat: (selectedChat: Chat | null) => void;
}

export interface UserData {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  avatar: string;
}

export interface User {
  _id: string;
  __v: number;
  name: string;
  email: string;
  avatar: string;
  createdAt: string;
  updatedAt: string;
}

export interface Chat {
  _id: string;
  __v: number;
  users: User[];
  chat_name: string;
  updatedAt: string;
  createdAt: string;
  is_group_chat: boolean;
}

export interface GroupForm {
  users: string[];
  chat_name: string;
}
