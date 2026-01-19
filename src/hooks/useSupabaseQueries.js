import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAchievements,
  fetchUserProgress,
  batchUpdateProgress,
  createAchievement,
  updateAchievement,
  deleteAchievement,
} from '../lib/api';

// ====================================================================
// 업적 조회 훅
// ====================================================================

/**
 * 전체 업적 목록 조회 훅
 */
export const useAchievements = () => {
  return useQuery({
    queryKey: ['achievements'],
    queryFn: fetchAchievements,
    staleTime: 60 * 60 * 1000, // 1시간 fresh (업적 목록은 거의 변하지 않음)
    cacheTime: 2 * 60 * 60 * 1000, // 2시간 캐시 유지
  });
};

// ====================================================================
// 사용자 진행 상황 훅
// ====================================================================

/**
 * 사용자 진행 상황 조회 훅
 * @param {string} nickname - 사용자 닉네임
 */
export const useUserProgress = (nickname) => {
  return useQuery({
    queryKey: ['userProgress', nickname],
    queryFn: () => fetchUserProgress(nickname),
    enabled: !!nickname, // nickname이 있을 때만 실행
    staleTime: 5 * 60 * 1000, // 5분 fresh
    cacheTime: 10 * 60 * 1000, // 10분 캐시 유지
  });
};

/**
 * 배치 업데이트 뮤테이션 훅
 */
export const useBatchUpdateProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ nickname, updates }) => batchUpdateProgress(nickname, updates),
    onSuccess: (data, variables) => {
      // 성공 시 userProgress만 refetch (achievements는 영향받지 않음)
      queryClient.refetchQueries({
        queryKey: ['userProgress', variables.nickname],
        exact: true,
      });
    },
  });
};

// ====================================================================
// 관리자용 뮤테이션 훅
// ====================================================================

/**
 * 업적 생성 뮤테이션 훅
 */
export const useCreateAchievement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ adminKey, achievement }) => createAchievement(adminKey, achievement),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
    },
  });
};

/**
 * 업적 수정 뮤테이션 훅
 */
export const useUpdateAchievement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ adminKey, id, updates }) => updateAchievement(adminKey, id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
    },
  });
};

/**
 * 업적 삭제 뮤테이션 훅
 */
export const useDeleteAchievement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ adminKey, id }) => deleteAchievement(adminKey, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
    },
  });
};
