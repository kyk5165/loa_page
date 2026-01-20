/**
 * API 요청 함수 모음
 * 백엔드와의 통신을 담당하는 함수들을 정의합니다.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// ====================================================================
// 인증 API
// ====================================================================

/**
 * JWT 토큰을 localStorage에서 가져오기
 * @returns {string|null} JWT 토큰
 */
export function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

/**
 * JWT 토큰 저장
 * @param {string} token - JWT 토큰
 */
export function setAuthToken(token) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', token);
}

/**
 * JWT 토큰 삭제
 */
export function removeAuthToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
}

/**
 * 회원가입
 * @param {string} nickname - 닉네임
 * @param {string} password - 비밀번호
 * @returns {Promise<{success: boolean, result?: {user: {id: number, nickname: string}, token: string}, error?: string, message?: string}>}
 */
export async function authRegister(nickname, password) {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ nickname, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      success: false,
      error: data.error || 'UNKNOWN_ERROR',
      message: data.message || '회원가입에 실패했습니다',
    };
  }

  return data;
}

/**
 * 기존 사용자 비밀번호 설정
 * @param {string} nickname - 닉네임
 * @param {string} password - 비밀번호
 * @returns {Promise<{success: boolean, result?: {user: {id: number, nickname: string}, token: string}, error?: string, message?: string}>}
 */
export async function authSetPassword(nickname, password) {
  const response = await fetch(`${API_BASE_URL}/api/auth/set-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ nickname, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      success: false,
      error: data.error || 'UNKNOWN_ERROR',
      message: data.message || '비밀번호 설정에 실패했습니다',
    };
  }

  return data;
}

/**
 * 로그인
 * @param {string} nickname - 닉네임
 * @param {string} password - 비밀번호
 * @returns {Promise<{success: boolean, result?: {user: {id: number, nickname: string}, token: string}, error?: string, message?: string}>}
 */
export async function authLogin(nickname, password) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ nickname, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      success: false,
      error: data.error || 'UNKNOWN_ERROR',
      message: data.message || '로그인에 실패했습니다',
    };
  }

  return data;
}

/**
 * 현재 사용자 정보 조회
 * @returns {Promise<{success: boolean, result?: {user: {id: number, nickname: string, created_at?: string}}, error?: string, message?: string}>}
 */
export async function authMe() {
  const token = getAuthToken();
  if (!token) {
    return {
      success: false,
      error: 'NO_TOKEN',
      message: '로그인이 필요합니다',
    };
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      success: false,
      error: data.error || 'UNKNOWN_ERROR',
      message: data.message || '사용자 정보 조회에 실패했습니다',
    };
  }

  return data;
}

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
 * 사용자 진행 상황 배치 업데이트 (JWT 인증 필요)
 * @param {Array<{achievementId: number, isCompleted: boolean}>} updates - 업데이트 목록
 * @returns {Promise<Object>} 업데이트 결과
 */
export async function batchUpdateProgress(updates) {
  const token = getAuthToken();
  if (!token) {
    throw new Error('인증이 필요합니다. 로그인 후 다시 시도해주세요.');
  }

  const response = await fetch(`${API_BASE_URL}/api/user-progress/batch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ updates }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    if (response.status === 401) {
      throw new Error(data.message || '인증이 만료되었습니다. 다시 로그인해주세요.');
    }
    throw new Error(data.message || 'Failed to update progress');
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
