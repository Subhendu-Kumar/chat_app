import { z } from "zod";
import { signinSchema, signupSchema } from "@/lib/validations";

export type signupData = Omit<z.infer<typeof signupSchema>, "confirmPassword">;

export type signInData = z.infer<typeof signinSchema>;

export interface AuthContextProps {
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  avatar: string;
}
