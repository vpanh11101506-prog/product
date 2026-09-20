import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  checkAdminStatus,
  loginAdmin,
  logoutAdmin,
  changeAdminPassword,
  getStoredAdminToken,
} from '../utils/portfolioApi';

interface AuthContextType {
  isAdmin: boolean;
  isChecking: boolean;
  isLoginModalOpen: boolean;
  isPasswordModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  openPasswordModal: () => void;
  closePasswordModal: () => void;
  login: (password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => Boolean(getStoredAdminToken()));
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  useEffect(() => {
    checkAdminStatus().then((res) => {
      setIsAdmin(res.isAdmin);
      setIsChecking(false);
    });
  }, []);

  const login = async (password: string) => {
    const res = await loginAdmin(password);
    if (res.success) {
      setIsAdmin(true);
      setIsLoginModalOpen(false);
    }
    return res;
  };

  const logout = async () => {
    await logoutAdmin();
    setIsAdmin(false);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    return changeAdminPassword(currentPassword, newPassword);
  };

  return (
    <AuthContext.Provider
      value={{
        isAdmin,
        isChecking,
        isLoginModalOpen,
        isPasswordModalOpen,
        openLoginModal: () => setIsLoginModalOpen(true),
        closeLoginModal: () => setIsLoginModalOpen(false),
        openPasswordModal: () => setIsPasswordModalOpen(true),
        closePasswordModal: () => setIsPasswordModalOpen(false),
        login,
        logout,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
