/**
 * API 요청 함수 모음
 * 백엔드와의 통신을 담당하는 함수들을 정의합니다.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// ====================================================================
// 업적 API
// ====================================================================

/**
 * 전체 업적 목록 조회
 * @returns {Promise<Array>} 업적 목록
 */
export async function fetchAchievements() {
  const response = await fetch(`${API_BASE_URL}/api/achievements`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Response error:', errorText);
    throw new Error(`Failed to fetch achievements: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// ====================================================================
// 사용자 진행 상황 API
// ====================================================================

/**
 * 사용자 진행 상황 조회
 * @param {string} nickname - 사용자 닉네임
 * @returns {Promise<Array>} 사용자 진행 상황 목록
 */
export async function fetchUserProgress(nickname) {
  if (!nickname) return [];

  const response = await fetch(
    `${API_BASE_URL}/api/user-progress?nickname=${encodeURIComponent(nickname)}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch user progress');
  }

  return response.json();
}

/**
 * 사용자 진행 상황 배치 업데이트
 * @param {string} nickname - 사용자 닉네임
 * @param {Array<{achievementId: number, isCompleted: boolean}>} updates - 업데이트 목록
 * @returns {Promise<Object>} 업데이트 결과
 */
export async function batchUpdateProgress(nickname, updates) {
  const response = await fetch(`${API_BASE_URL}/api/user-progress/batch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ nickname, updates }),
  });

  if (!response.ok) {
    throw new Error('Failed to update progress');
  }

  const result = await response.json();
  return result.result;
}

// ====================================================================
// 관리자 API
// ====================================================================

/**
 * 관리자 비밀번호 검증
 * @param {string} adminKey - 관리자 비밀번호
 * @returns {Promise<{valid: boolean, status: number}>} 검증 결과
 */
export async function verifyAdminKey(adminKey) {
  const response = await fetch(`${API_BASE_URL}/api/admin/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminKey}`,
    },
  });

  return {
    valid: response.ok,
    status: response.status,
  };
}

/**
 * 업적 생성
 * @param {string} adminKey - 관리자 비밀번호
 * @param {Object} achievement - 업적 데이터
 * @returns {Promise<Object>} 생성된 업적
 */
export async function createAchievement(adminKey, achievement) {
  const response = await fetch(`${API_BASE_URL}/api/admin/achievements`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminKey}`,
    },
    body: JSON.stringify(achievement),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to create achievement: ${response.status}`);
  }

  return response.json();
}

/**
 * 업적 수정
 * @param {string} adminKey - 관리자 비밀번호
 * @param {number} id - 업적 ID
 * @param {Object} updates - 수정할 데이터
 * @returns {Promise<Object>} 수정된 업적
 */
export async function updateAchievement(adminKey, id, updates) {
  const response = await fetch(`${API_BASE_URL}/api/admin/achievements/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminKey}`,
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to update achievement: ${response.status}`);
  }

  return response.json();
}

/**
 * 업적 삭제
 * @param {string} adminKey - 관리자 비밀번호
 * @param {number} id - 업적 ID
 * @returns {Promise<Object>} 삭제 결과
 */
export async function deleteAchievement(adminKey, id) {
  const response = await fetch(`${API_BASE_URL}/api/admin/achievements/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${adminKey}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to delete achievement: ${response.status}`);
  }

  return response.json();
}
