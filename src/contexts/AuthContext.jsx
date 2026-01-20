'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  authMe,
  authLogin,
  authRegister,
  authSetPassword,
} from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 초기 인증 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      const result = await authMe();
      if (result.success) {
        setUser(result.result.user);
        setIsAuthenticated(true);
      } else {
        // 토큰이 유효하지 않으면 삭제
        removeAuthToken();
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // 로그인
  const login = useCallback(async (nickname, password) => {
    const result = await authLogin(nickname, password);

    if (result.success) {
      setAuthToken(result.result.token);
      setUser(result.result.user);
      setIsAuthenticated(true);
      // 기존 닉네임 localStorage도 업데이트 (호환성)
      localStorage.setItem('checklist_nickname', result.result.user.nickname);
    }

    return result;
  }, []);

  // 회원가입
  const register = useCallback(async (nickname, password) => {
    const result = await authRegister(nickname, password);

    if (result.success) {
      setAuthToken(result.result.token);
      setUser(result.result.user);
      setIsAuthenticated(true);
      // 기존 닉네임 localStorage도 업데이트 (호환성)
      localStorage.setItem('checklist_nickname', result.result.user.nickname);
    }

    return result;
  }, []);

  // 기존 사용자 비밀번호 설정
  const setPassword = useCallback(async (nickname, password) => {
    const result = await authSetPassword(nickname, password);

    if (result.success) {
      setAuthToken(result.result.token);
      setUser(result.result.user);
      setIsAuthenticated(true);
      // 기존 닉네임 localStorage도 업데이트 (호환성)
      localStorage.setItem('checklist_nickname', result.result.user.nickname);
    }

    return result;
  }, []);

  // 로그아웃
  const logout = useCallback(() => {
    removeAuthToken();
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('checklist_nickname');
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    setPassword,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
