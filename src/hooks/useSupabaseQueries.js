import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// API 서버 URL (환경 변수에서 가져오거나 기본값 사용)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// 업적 목록 조회
export const useAchievements = () => {
  return useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      console.log('Fetching achievements from:', `${API_BASE_URL}/api/achievements`);
      const response = await fetch(`${API_BASE_URL}/api/achievements`);
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`Failed to fetch achievements: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Response data:', result);
      return result;
    },
    staleTime: 60 * 60 * 1000, // 1시간간 fresh (업적 목록은 거의 변하지 않음)
    cacheTime: 2 * 60 * 60 * 1000, // 2시간간 캐시 유지
  });
};

// 사용자 진행 상황 조회
export const useUserProgress = (nickname) => {
  return useQuery({
    queryKey: ['userProgress', nickname],
    queryFn: async () => {
      if (!nickname) return [];
      
      const response = await fetch(`${API_BASE_URL}/api/user-progress?nickname=${encodeURIComponent(nickname)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user progress');
      }
      const result = await response.json();
      return result;
    },
    enabled: !!nickname, // nickname이 있을 때만 실행
    staleTime: 5 * 60 * 1000, // 5분간 fresh (사용자 진행상황은 자주 변할 수 있음)
    cacheTime: 10 * 60 * 1000, // 10분간 캐시 유지
  });
};

// 배치 업데이트 뮤테이션
export const useBatchUpdateProgress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ nickname, updates }) => {
      const response = await fetch(`${API_BASE_URL}/api/user-progress/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nickname,
          updates,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update progress');
      }
      
      const result = await response.json();
      return result.result;
    },
    onSuccess: (data, variables) => {
      // 성공 시 userProgress만 refetch (achievements는 영향받지 않음)
      queryClient.refetchQueries({
        queryKey: ['userProgress', variables.nickname],
        exact: true
      });
    },
  });
};
