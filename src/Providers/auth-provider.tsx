"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock authentication check
    const mockUser = {
      id: "1",
      name: "João Silva",
      email: "joao@example.com",
      avatar: "/Whisk_dbc581f98f.jpg?height=32&width=32",
      isAdmin: true,
    };
    setUser(mockUser);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    // Mock login logic
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const mockUser = {
      id: "1",
      name: "João Silva",
      email,
      isAdmin: email === "admin@example.com",
    };
    setUser(mockUser);
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
