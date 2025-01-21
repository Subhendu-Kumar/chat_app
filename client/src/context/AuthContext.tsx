import { AuthContextProps, Chat, UserData } from "@/types";
import { createContext, useContext, useEffect, useState } from "react";
import { clearUserData, getToken, getUserData, setToken } from "@/lib/utils";

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [reload, setReload] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<UserData | null>(null);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const token = getToken();
    const data = getUserData();
    setIsAuthenticated(!!token);
    setUser(data);
    setLoading(false);
  }, [isAuthenticated]);

  const login = (token: string) => {
    setToken(token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    clearUserData();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        chats,
        logout,
        reload,
        loading,
        setChats,
        setReload,
        selectedChat,
        setSelectedChat,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
