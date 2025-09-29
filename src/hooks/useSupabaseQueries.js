import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 업적 목록 조회
export const useAchievements = () => {
  return useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievements')
        .select('id, name, content, point')
        .order('id', { ascending: true });
      
      if (error) throw error;
      return data;
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
      
      const { data, error } = await supabase
        .from('user_progress')
        .select('id, achievement_id, is_completed')
        .eq('nickname', nickname);
      
      if (error) throw error;
      return data;
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
      const updateData = updates.map(({ achievementId, isCompleted }) => ({
        nickname,
        achievement_id: achievementId,
        is_completed: isCompleted,
      }));

      const { error } = await supabase
        .from('user_progress')
        .upsert(updateData, { onConflict: 'nickname,achievement_id' });
      
      if (error) throw error;
      return updateData;
    },
    onSuccess: (data, variables) => {
      // 성공 시 캐시 무효화하여 최신 데이터 다시 가져오기
      queryClient.invalidateQueries(['userProgress', variables.nickname]);
    },
  });
};
