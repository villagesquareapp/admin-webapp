"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface RegisterContextType {
  registerData: {
    username: string;
    email: string;
    name: string;
    password: string;
    referrer_code?: string;
  } | null;
  setRegisterData: (data: {
    username: string;
    email: string;
    name: string;
    password: string;
    referrer_code?: string;
  }) => void;
}

const RegisterContext = createContext<RegisterContextType | undefined>(undefined);

export function RegisterProvider({ children }: { children: ReactNode }) {
  const [registerData, setRegisterData] = useState<RegisterContextType["registerData"]>(null);

  return (
    <RegisterContext.Provider value={{ registerData, setRegisterData }}>
      {children}
    </RegisterContext.Provider>
  );
}

export function useRegisterContext() {
  const context = useContext(RegisterContext);
  if (context === undefined) {
    throw new Error("useRegisterContext must be used within a RegisterProvider");
  }
  return context;
}
