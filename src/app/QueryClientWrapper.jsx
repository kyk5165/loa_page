'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';

export function QueryClientWrapper({ children }) {
  // QueryClient를 클라이언트에서 생성하여 서버-클라이언트 전달 문제 해결
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5분간 fresh 상태 유지
        cacheTime: 10 * 60 * 1000, // 10분간 캐시 유지
        refetchOnWindowFocus: false, // 창 포커스 시 재요청 방지
        refetchOnReconnect: false, // 재연결 시 재요청 방지
        retry: 1, // 실패 시 1번만 재시도
      },
      mutations: {
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
}
