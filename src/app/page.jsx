'use client'; // 이 파일이 클라이언트 컴포넌트임을 Next.js에 알립니다.

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Check, Square, Search, Filter, Loader2, LogOut, ArrowLeft } from 'lucide-react';

// ====================================================================
// ⚠️ 1. Supabase 환경 변수 설정
// 이 값들은 3단계에서 Supabase 프로젝트를 만든 후 실제로 채워 넣어야 합니다.
// ====================================================================
// src/app/page.jsx 상단 수정
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY;
const API_BASE_URL = `${SUPABASE_URL}/rest/v1`;

// ====================================================================
// 2. [제거됨] 정적 업적 목록 (DB에서 동적으로 가져옵니다)
// ====================================================================

/**
 * 디바운스 유틸리티 함수 (검색 성능 최적화)
 */
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
};

// ====================================================================
// 3. 메인 애플리케이션 컴포넌트 (Next.js의 page 컴포넌트 역할)
// ====================================================================

export default function App() { // Next.js page 컴포넌트는 기본 내보내기(default export)를 사용합니다.
    const [nickname, setNickname] = useState('');
    const [allAchievements, setAllAchievements] = useState([]); // 새 상태: 전체 업적 목록
    const [progress, setProgress] = useState([]); // 사용자 진행 상황과 병합된 최종 목록
    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState('all'); // 'all', 'completed', 'incomplete'
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [isMounted, setIsMounted] = useState(false); // 클라이언트 마운트 상태 추적을 위한 상태 추가

    // 닉네임 유효성 검사 (로컬 스토리지에서 닉네임 불러오기)
    useEffect(() => {
        const storedNickname = localStorage.getItem('checklist_nickname');
        if (storedNickname) {
            setNickname(storedNickname);
        }
        setIsMounted(true); // 로컬 스토리지 확인 후 클라이언트 마운트 완료
    }, []);

    // 4. 데이터 로드 로직 (전체 업적 목록 + 사용자 진행 상황)
    const fetchUserProgress = useCallback(async (currentNickname) => {
        setIsLoading(true);
        setError(null);

        if (!currentNickname || !SUPABASE_URL || SUPABASE_URL.includes('YOUR_SUPABASE_PROJECT_URL')) {
            // Supabase 설정이 안 된 경우, 오류 메시지 표시
            setError("Supabase 설정이 필요합니다. 환경 변수를 확인해주세요.");
            setIsLoading(false);
            return;
        }

        try {
            // 1. 전체 업적 목록 (achievements 테이블) 조회
            const achievementsResponse = await fetch(`${API_BASE_URL}/achievements?select=id,name,content&order=id.asc`, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                }
            });

            if (!achievementsResponse.ok) {
                throw new Error(`업적 목록 로드 실패: ${achievementsResponse.statusText}`);
            }
            const achievementsList = await achievementsResponse.json();
            setAllAchievements(achievementsList); // 전체 업적 목록 상태 저장

            // 2. 사용자 진행 상황 (user_progress 테이블) 조회
            const progressResponse = await fetch(`${API_BASE_URL}/user_progress?nickname=eq.${encodeURIComponent(currentNickname)}&select=id,achievement_id,is_completed`, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                }
            });

            if (!progressResponse.ok) {
                throw new Error(`진행 상황 로드 실패: ${progressResponse.statusText}`);
            }
            const progressData = await progressResponse.json();

            // 3. 정적 업적 목록과 사용자 진행 상황을 병합
            const mergedList = achievementsList.map(ach => {
                const userStatus = progressData.find(p => p.achievement_id === ach.id);
                return {
                    ...ach,
                    is_completed: userStatus ? userStatus.is_completed : false,
                    progress_id: userStatus ? userStatus.id : null,
                };
            });
            setProgress(mergedList);

        } catch (err) {
            console.error('Error fetching progress:', err);
            setError(`데이터 로드 실패: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [SUPABASE_URL, SUPABASE_KEY, API_BASE_URL]);

    // 닉네임이 변경되거나 초기화될 때 데이터 로드
    useEffect(() => {
        if (nickname && isMounted) { // isMounted 상태를 추가하여 클라이언트 로드 후 실행 보장
            fetchUserProgress(nickname);
        }
    }, [nickname, fetchUserProgress, isMounted]);

    // 5. 데이터 업데이트 로직 (체크박스 토글) - Supabase Upsert 사용
    const toggleCompletion = useCallback(async (achievementId, currentStatus) => {
        const newStatus = !currentStatus;

        // 1. 로컬 상태 즉시 업데이트 (사용자 경험 개선)
        setProgress(prev => prev.map(a =>
            a.id === achievementId ? { ...a, is_completed: newStatus } : a
        ));

        if (!nickname || !SUPABASE_URL || SUPABASE_URL.includes('YOUR_SUPABASE_PROJECT_URL')) {
            console.warn('Supabase URL/Key가 설정되지 않아 로컬에서만 상태 변경됨.');
            return;
        }

        const payload = {
            nickname: nickname,
            achievement_id: achievementId,
            is_completed: newStatus,
        };

        try {
            // Supabase Upsert 요청 (POST + resolution=merge-duplicates 헤더)
            const response = await fetch(`${API_BASE_URL}/user_progress`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Prefer': 'resolution=merge-duplicates', // Upsert 옵션: 충돌 시 업데이트
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '데이터 업데이트 실패');
            }
        } catch (err) {
            console.error('Error updating progress:', err);
            setError(`업데이트 실패: ${err.message}`);
            // 실패 시 로컬 상태 롤백 (선택적)
            setProgress(prev => prev.map(a =>
                a.id === achievementId ? { ...a, is_completed: currentStatus } : a
            ));
        }
    }, [nickname, SUPABASE_URL, SUPABASE_KEY, API_BASE_URL]);


    // 6. 필터링 및 검색 로직
    const filteredAndSearchedList = useMemo(() => {
        let list = progress;

        // 1. 필터링
        if (filter === 'completed') {
            list = list.filter(item => item.is_completed);
        } else if (filter === 'incomplete') {
            list = list.filter(item => !item.is_completed);
        }

        // 2. 검색
        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            list = list.filter(item =>
                item.name.toLowerCase().includes(lowerCaseSearchTerm) ||
                item.content.toLowerCase().includes(lowerCaseSearchTerm)
            );
        }

        return list;
    }, [progress, filter, searchTerm]);

    // 7. 클라이언트 마운트 전 로딩 상태 (하이드레이션 오류 방지)
    if (!isMounted) {
        return (
             <div className="min-h-screen flex items-center justify-center bg-gray-50">
                 <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
             </div>
        );
    }

    // 8. UI 렌더링 - 닉네임 입력 화면
    if (!nickname) {
        return (
            <NicknameInput
                onNicknameSet={(input) => {
                    localStorage.setItem('checklist_nickname', input);
                    setNickname(input);
                }}
            />
        );
    }

    // 9. UI 렌더링 - 체크리스트 화면
    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8 flex justify-center">
            <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl p-6 sm:p-8">
                <header className="mb-8 border-b pb-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">나의 업적 체크리스트</h1>
                        <p className="text-lg text-indigo-600 font-medium mt-1 flex items-center">
                            <ArrowLeft className="h-4 w-4 mr-2 inline sm:hidden cursor-pointer" onClick={() => {
                                localStorage.removeItem('checklist_nickname');
                                setNickname('');
                            }}/>
                            {nickname}님의 기록
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            localStorage.removeItem('checklist_nickname');
                            setNickname('');
                        }}
                        className="hidden sm:flex items-center text-sm text-gray-500 hover:text-red-600 transition duration-150 p-2 rounded-full hover:bg-red-50"
                        title="다른 닉네임으로 접속"
                    >
                        <LogOut className="h-4 w-4 mr-1" />
                        로그아웃
                    </button>
                </header>

                <Controls
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    filter={filter}
                    setFilter={setFilter}
                />

                <Checklist
                    list={filteredAndSearchedList}
                    toggleCompletion={toggleCompletion}
                    isLoading={isLoading}
                    error={error}
                    totalCount={allAchievements.length} // 전체 목록 길이 사용
                    completedCount={progress.filter(a => a.is_completed).length}
                />

                {SUPABASE_URL && SUPABASE_URL.includes('YOUR_SUPABASE_PROJECT_URL') && (
                    <div className="mt-8 p-4 bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500 rounded-md">
                        <p className="font-semibold">⚠️ Supabase 설정 필요</p>
                        <p className="text-sm">`NEXT_PUBLIC_SUPABASE_URL`와 `NEXT_PUBLIC_SUPABASE_KEY`가 환경 변수 또는 코드에 설정되지 않았습니다. 실제 저장을 위해서는 값을 채워주세요.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ====================================================================
// 10. 보조 컴포넌트
// ====================================================================

/** 닉네임 입력 화면 */
const NicknameInput = ({ onNicknameSet }) => {
    const [input, setInput] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim().length < 2) {
            setError('닉네임은 2자 이상이어야 합니다.');
            return;
        }
        setError('');
        onNicknameSet(input.trim());
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">닉네임으로 접속</h2>
                <p className="text-sm text-gray-500 mb-6">사용자 닉네임을 입력하시면 개인 기록이 저장됩니다.</p>

                <div className="mb-4">
                    <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
                        닉네임
                    </label>
                    <input
                        id="nickname"
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="예: 용감한_개척자"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition ${error ? 'border-red-500' : 'border-gray-300'}`}
                        maxLength={20}
                    />
                    {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                </div>

                <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition duration-300 shadow-md"
                >
                    체크리스트 접속
                </button>
            </form>
        </div>
    );
};

/** 검색 및 필터링 컨트롤 */
const Controls = React.memo(({ searchTerm, setSearchTerm, filter, setFilter }) => {
    const filters = [
        { key: 'all', label: '전체' },
        { key: 'completed', label: '완료' },
        { key: 'incomplete', label: '미완료' },
    ];

    const debouncedSetSearchTerm = useMemo(() => debounce(setSearchTerm, 300), [setSearchTerm]);

    return (
        <div className="mb-6 space-y-4 md:space-y-0 md:flex md:gap-4">
            {/* 검색 입력란 */}
            <div className="relative flex-grow">
                <input
                    type="text"
                    placeholder="업적 이름 또는 내용을 검색..."
                    onChange={(e) => debouncedSetSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition"
                    aria-label="업적 검색"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>

            {/* 필터 버튼 그룹 */}
            <div className="flex bg-gray-100 rounded-xl p-1 shrink-0">
                <Filter className="h-5 w-5 text-gray-500 my-auto ml-2 mr-1 hidden sm:block" />
                {filters.map((f) => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition duration-200 ${
                            filter === f.key
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>
        </div>
    );
});

/** 체크리스트 목록 표시 */
const Checklist = ({ list, toggleCompletion, isLoading, error, totalCount, completedCount }) => {

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mr-3" />
                <span className="text-gray-600">데이터 로드 중...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-100 text-red-800 border-l-4 border-red-500 rounded-md mt-4">
                <p className="font-semibold">에러 발생</p>
                <p className="text-sm">{error}</p>
            </div>
        );
    }

    const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return (
        <div className="mt-6">
            <div className="mb-4 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                <p className="text-lg font-semibold text-indigo-700">진행률: {completedCount} / {totalCount} ({completionRate}%)</p>
                <div className="w-full bg-indigo-200 rounded-full h-2.5 mt-2">
                    <div
                        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${completionRate}%` }}
                    ></div>
                </div>
            </div>

            {list.length === 0 ? (
                <div className="text-center p-10 text-gray-500 bg-gray-50 rounded-xl">
                    <p>조건에 맞는 업적이 없습니다.</p>
                </div>
            ) : (
                <ul className="space-y-3">
                    {list.map((item) => (
                        <li
                            key={item.id}
                            className={`flex items-start p-4 rounded-xl transition duration-200 cursor-pointer border ${item.is_completed ? 'bg-green-50 border-green-200 shadow-sm' : 'bg-white border-gray-200 hover:border-indigo-300'}`}
                            onClick={() => toggleCompletion(item.id, item.is_completed)}
                        >
                            <div className="flex-shrink-0 mr-4">
                                {item.is_completed ? (
                                    <Check className="h-6 w-6 text-green-600 mt-0.5" />
                                ) : (
                                    <Square className="h-6 w-6 text-gray-400 mt-0.5" />
                                )}
                            </div>
                            <div className="flex-grow">
                                <h3 className={`text-base font-semibold ${item.is_completed ? 'text-gray-700 line-through' : 'text-gray-800'}`}>
                                    N{item.id}. {item.name}
                                </h3>
                                <p className={`text-sm mt-0.5 ${item.is_completed ? 'text-gray-500 line-through' : 'text-gray-600'}`}>
                                    {item.content}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
