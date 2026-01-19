'use client'; // Next.js 클라이언트 컴포넌트임을 알림

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Check, Square, Search, Filter, Loader2, LogOut, ArrowLeft, RotateCcw, AlertTriangle, MessageCircle, Ship } from 'lucide-react';
import Link from 'next/link';
import { useAchievements, useUserProgress, useBatchUpdateProgress } from '../hooks/useSupabaseQueries';

// ====================================================================
// 1. 환경 변수 확인
// ====================================================================
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

// ====================================================================
// 2. 디바운스 유틸리티
// ====================================================================
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
};

// ====================================================================
// 3. Discord URL 생성 함수
// ====================================================================
const getDiscordUrl = (discordUrl) => {
    if (!discordUrl) return null;
    return `https://discord.com/channels/${discordUrl}`;
};

// ====================================================================
// 3. 메인 페이지 컴포넌트
// ====================================================================
export default function App() {
    const [nickname, setNickname] = useState('');
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isMounted, setIsMounted] = useState(false);
    const [pendingUpdates, setPendingUpdates] = useState(new Map()); // 배치 업데이트용
    const [showToggleAllModal, setShowToggleAllModal] = useState(false); // 전체 토글 경고 모달

    // React Query 훅들
    const { data: allAchievements = [], isLoading: achievementsLoading, error: achievementsError } = useAchievements();
    const { data: userProgress = [], isLoading: progressLoading, error: progressError } = useUserProgress(nickname);
    const batchUpdateMutation = useBatchUpdateProgress();

    // 닉네임 로컬스토리지에서 불러오기
    useEffect(() => {
        const storedNickname = localStorage.getItem('checklist_nickname');
        if (storedNickname) {
            setNickname(storedNickname);
        }
        setIsMounted(true);
    }, []);

    // ----------------------------------------------------------------
    // 4. 데이터 병합 (React Query 데이터 사용)
    // ----------------------------------------------------------------
    const progress = useMemo(() => {
        if (!allAchievements.length || !userProgress.length) {
            return allAchievements.map(ach => ({
                ...ach,
                is_completed: false,
                progress_id: null,
            }));
        }

        return allAchievements.map((ach) => {
            const userStatus = userProgress.find((p) => p.achievement_id === ach.id);
            return {
                ...ach,
                is_completed: userStatus ? userStatus.is_completed : false,
                progress_id: userStatus ? userStatus.id : null,
            };
        });
    }, [allAchievements, userProgress]);

    // 활성 업적 (is_legacy === false) - 통계 계산용
    const activeProgress = useMemo(() => {
        return progress.filter(ach => !ach.is_legacy);
    }, [progress]);

    // 유산 업적 (is_legacy === true)
    const legacyProgress = useMemo(() => {
        return progress.filter(ach => ach.is_legacy);
    }, [progress]);

    // 로컬 스토리지에 변경사항 백업
    const saveToLocalStorage = useCallback((updates) => {
        try {
            const backupKey = `pending_updates_${nickname}`;
            localStorage.setItem(backupKey, JSON.stringify(Array.from(updates.entries())));
            console.log('변경사항 로컬 백업 완료');
        } catch (error) {
            console.warn('로컬 백업 실패:', error);
        }
    }, [nickname]);

    // 로컬 스토리지에서 변경사항 복원
    const loadFromLocalStorage = useCallback(() => {
        try {
            const backupKey = `pending_updates_${nickname}`;
            const backup = localStorage.getItem(backupKey);
            if (backup) {
                const updates = new Map(JSON.parse(backup));
                setPendingUpdates(updates);
                console.log('로컬 백업에서 변경사항 복원');
                return updates;
            }
        } catch (error) {
            console.warn('로컬 복원 실패:', error);
        }
        return new Map();
    }, [nickname]);

    // 배치 업데이트 저장 함수
    const saveBatchUpdates = useCallback(async () => {
        if (pendingUpdates.size === 0 || !nickname) return;

        const updates = Array.from(pendingUpdates.entries()).map(([achievementId, isCompleted]) => ({
            achievementId,
            isCompleted,
        }));

        console.log(`배치 업데이트: ${updates.length}개 항목 저장 (요청 절약)`);
        
        try {
            await batchUpdateMutation.mutateAsync({ nickname, updates });
            setPendingUpdates(new Map());
            
            // 성공 시 로컬 백업 삭제
            const backupKey = `pending_updates_${nickname}`;
            localStorage.removeItem(backupKey);
            
            console.log('배치 업데이트 완료');
        } catch (err) {
            console.error('배치 업데이트 실패:', err);
            // 실패 시 로컬 백업 유지
        }
    }, [pendingUpdates, nickname, batchUpdateMutation]);

    // 자동 저장 타이머 (3초 후 자동 저장)
    useEffect(() => {
        if (pendingUpdates.size === 0) return;

        const timer = setTimeout(() => {
            saveBatchUpdates();
        }, 3000);

        return () => clearTimeout(timer);
    }, [pendingUpdates, saveBatchUpdates]);

    // 페이지 이탈 시 즉시 저장
    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (pendingUpdates.size > 0) {
                // 동기적으로 저장 시도
                saveBatchUpdates();
                
                // 사용자에게 알림
                event.preventDefault();
                event.returnValue = '저장되지 않은 변경사항이 있습니다. 페이지를 떠나시겠습니까?';
                return event.returnValue;
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden' && pendingUpdates.size > 0) {
                // 탭이 숨겨질 때 저장
                saveBatchUpdates();
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [pendingUpdates, saveBatchUpdates]);

    // ----------------------------------------------------------------
    // 5. 진행 상황 토글 (배치 업데이트 방식)
    // ----------------------------------------------------------------
    const toggleCompletion = useCallback((achievementId, currentStatus) => {
        const newStatus = !currentStatus;

        if (!nickname || !API_URL?.startsWith('http')) {
            console.warn('API 서버 미설정. 로컬 상태만 변경됨.');
            return;
        }

        // 배치 업데이트 큐에 추가 (즉시 저장하지 않음)
        setPendingUpdates(prev => {
            const newMap = new Map(prev);
            newMap.set(achievementId, newStatus);
            
            // 로컬 스토리지에 백업
            saveToLocalStorage(newMap);
            
            return newMap;
        });
    }, [nickname, saveToLocalStorage]);

    // 전체 토글 함수 (활성 업적만)
    const toggleAllAchievements = useCallback(() => {
        if (!nickname || !API_URL?.startsWith('http')) {
            console.warn('API 서버 미설정. 로컬 상태만 변경됨.');
            return;
        }

        // 현재 진행상황을 기반으로 전체 반전 (활성 업적만)
        const newUpdates = new Map();
        activeProgress.forEach(item => {
            const pendingUpdate = pendingUpdates.get(item.id);
            const currentStatus = pendingUpdate !== undefined ? pendingUpdate : item.is_completed;
            newUpdates.set(item.id, !currentStatus);
        });

        setPendingUpdates(newUpdates);

        // 로컬 스토리지에 백업
        saveToLocalStorage(newUpdates);

        console.log(`전체 ${activeProgress.length}개 업적 상태 반전`);
    }, [nickname, activeProgress, pendingUpdates, saveToLocalStorage]);

    // 페이지 로드 시 로컬 백업 복원
    useEffect(() => {
        if (nickname && isMounted) {
            const restoredUpdates = loadFromLocalStorage();
            if (restoredUpdates.size > 0) {
                console.log(`${restoredUpdates.size}개 미저장 변경사항 복원됨`);
            }
        }
    }, [nickname, isMounted, loadFromLocalStorage]);

    // ----------------------------------------------------------------
    // 6. 포인트 계산 (활성 업적만)
    // ----------------------------------------------------------------
    const pointStats = useMemo(() => {
        const totalPoints = activeProgress.reduce((sum, item) => sum + (item.point || 0), 0);

        const completedPoints = activeProgress.reduce((sum, item) => {
            const pendingUpdate = pendingUpdates.get(item.id);
            const isCompleted = pendingUpdate !== undefined ? pendingUpdate : item.is_completed;
            return isCompleted ? sum + (item.point || 0) : sum;
        }, 0);

        const remainingPoints = totalPoints - completedPoints;

        return {
            total: totalPoints,
            completed: completedPoints,
            remaining: remainingPoints
        };
    }, [activeProgress, pendingUpdates]);

    // ----------------------------------------------------------------
    // 7. 필터링 + 검색
    // ----------------------------------------------------------------
    const filteredAndSearchedList = useMemo(() => {
        // 유산 필터: is_legacy === true인 업적만 표시
        // 그 외 필터: is_legacy === false인 업적만 표시
        let list = filter === 'legacy' ? legacyProgress : activeProgress;

        if (filter === 'completed') {
            list = list.filter(item => item.is_completed);
        } else if (filter === 'incomplete') {
            list = list.filter(item => !item.is_completed);
        }
        // 'legacy' 필터는 추가 필터링 없이 전체 유산 업적 표시

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            list = list.filter(item =>
                item.name.toLowerCase().includes(term) ||
                item.content.toLowerCase().includes(term)
            );
        }
        return list;
    }, [activeProgress, legacyProgress, filter, searchTerm]);

    // 로딩 상태와 에러 처리
    const isLoading = achievementsLoading || progressLoading;
    const error = achievementsError || progressError;

    // ----------------------------------------------------------------
    // 7. UI 렌더링
    // ----------------------------------------------------------------
    if (!isMounted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
            </div>
        );
    }

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

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8 flex justify-center">
            <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl p-6 sm:p-8">
                <header className="mb-8 border-b pb-4 flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <h1 className="text-3xl font-bold text-gray-800">나의 업적 체크리스트</h1>
                            <Link 
                                href="/ship-calculator"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                                <Ship className="w-4 h-4" />
                                선박 계산기
                            </Link>
                        </div>
                        <p className="text-lg text-indigo-600 font-medium mt-1 flex items-center">
                            <ArrowLeft
                                className="h-4 w-4 mr-2 inline sm:hidden cursor-pointer"
                                onClick={() => {
                                    localStorage.removeItem('checklist_nickname');
                                    setNickname('');
                                }}
                            />
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
                    onToggleAll={() => setShowToggleAllModal(true)}
                />

                <Checklist
                    list={filteredAndSearchedList}
                    toggleCompletion={toggleCompletion}
                    isLoading={isLoading}
                    error={error}
                    totalCount={activeProgress.length}
                    completedCount={activeProgress.filter(a => {
                        const pendingUpdate = pendingUpdates.get(a.id);
                        const isCompleted = pendingUpdate !== undefined ? pendingUpdate : a.is_completed;
                        return isCompleted;
                    }).length}
                    pointStats={pointStats}
                    pendingUpdates={pendingUpdates}
                    isSaving={batchUpdateMutation.isPending}
                    onSaveNow={saveBatchUpdates}
                    isLegacyView={filter === 'legacy'}
                    legacyCount={legacyProgress.length}
                />

                {/* 전체 토글 경고 모달 */}
                {showToggleAllModal && (
                    <ToggleAllModal
                        onConfirm={() => {
                            toggleAllAchievements();
                            setShowToggleAllModal(false);
                        }}
                        onCancel={() => setShowToggleAllModal(false)}
                        totalCount={activeProgress.length}
                    />
                )}
            </div>
        </div>
    );
}

// ====================================================================
// 보조 컴포넌트
// ====================================================================
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
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-900 placeholder-gray-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
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

const Controls = React.memo(({ searchTerm, setSearchTerm, filter, setFilter, onToggleAll }) => {
    const filters = [
        { key: 'all', label: '전체' },
        { key: 'completed', label: '완료' },
        { key: 'incomplete', label: '미완료' },
        { key: 'legacy', label: '유산' },
    ];

    const debouncedSetSearchTerm = useMemo(() => debounce(setSearchTerm, 300), [setSearchTerm]);

    return (
        <div className="mb-6 space-y-4 md:space-y-0 md:flex md:gap-4">
            <div className="relative flex-grow">
                <input
                    type="text"
                    placeholder="업적 이름 또는 내용을 검색..."
                    onChange={(e) => debouncedSetSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-900 placeholder-gray-500 bg-white shadow-sm"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>

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

            <button
                onClick={onToggleAll}
                className="flex items-center px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-xl hover:bg-orange-600 transition duration-200 shadow-sm"
                title="전체 업적 상태 반전"
            >
                <RotateCcw className="h-4 w-4 mr-2" />
                전체 반전
            </button>
        </div>
    );
});

const ToggleAllModal = ({ onConfirm, onCancel, totalCount }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                        <AlertTriangle className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">전체 상태 반전</h3>
                        <p className="text-sm text-gray-500">모든 업적의 완료 상태가 반전됩니다</p>
                    </div>
                </div>

                <div className="mb-6">
                    <p className="text-gray-700 mb-2">
                        <strong>{totalCount}개</strong>의 업적 상태가 모두 반전됩니다.
                    </p>
                    <p className="text-sm text-gray-500">
                        이 작업은 되돌릴 수 없습니다. 계속하시겠습니까?
                    </p>
                </div>

                <div className="flex space-x-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition duration-200 font-medium"
                    >
                        취소
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition duration-200 font-medium"
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
};

const Checklist = ({ list, toggleCompletion, isLoading, error, totalCount, completedCount, pointStats, pendingUpdates, isSaving, onSaveNow, isLegacyView, legacyCount }) => {
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
                <p className="text-sm">{error.message || error.toString()}</p>
            </div>
        );
    }

    const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return (
        <div className="mt-6">
            {isLegacyView ? (
                <div className="mb-4 p-4 bg-gray-100 rounded-xl border border-gray-300">
                    <div className="flex items-center">
                        <div>
                            <p className="text-lg font-semibold text-gray-700">
                                유산 업적 (총 {legacyCount}개)
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                더 이상 히든 업적에 포함되지 않는 업적들입니다. 포인트가 적용되지 않습니다.
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="mb-4 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-lg font-semibold text-indigo-700">
                                진행률: {completedCount} / {totalCount} ({completionRate}%)
                            </p>
                            <div className="mt-2 flex flex-wrap gap-4 text-sm">
                                <div className="flex items-center">
                                    <span className="text-gray-600 mr-1">총 포인트:</span>
                                    <span className="font-semibold text-indigo-700">{pointStats.total.toLocaleString()}P</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-gray-600 mr-1">완료 포인트:</span>
                                    <span className="font-semibold text-green-600">{pointStats.completed.toLocaleString()}P</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-gray-600 mr-1">남은 포인트:</span>
                                    <span className="font-semibold text-orange-600">{pointStats.remaining.toLocaleString()}P</span>
                                </div>
                            </div>
                        </div>
                        {pendingUpdates.size > 0 && (
                            <div className="flex items-center space-x-2">
                                {isSaving ? (
                                    <div className="flex items-center text-sm text-orange-600">
                                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                        저장 중...
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-orange-600">
                                            {pendingUpdates.size}개 변경사항 대기 중
                                        </span>
                                        <button
                                            onClick={onSaveNow}
                                            className="px-3 py-1 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition"
                                        >
                                            지금 저장
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="w-full bg-indigo-200 rounded-full h-2.5 mt-2">
                        <div
                            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${completionRate}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {list.length === 0 ? (
                <div className="text-center p-10 text-gray-500 bg-gray-50 rounded-xl">
                    <p>조건에 맞는 업적이 없습니다.</p>
                </div>
            ) : (
                <ul className="space-y-3">
                    {list.map((item) => {
                        const pendingUpdate = pendingUpdates.get(item.id);
                        const isCompleted = pendingUpdate !== undefined ? pendingUpdate : item.is_completed;
                        
                        return (
                            <li
                                key={item.id}
                                className={`flex items-start p-4 rounded-xl transition duration-200 cursor-pointer border ${
                                    isCompleted
                                        ? 'bg-green-50 border-green-200 shadow-sm'
                                        : 'bg-white border-gray-200 hover:border-indigo-300'
                                }`}
                                onClick={() => toggleCompletion(item.id, item.is_completed)}
                            >
                                <div className="flex-shrink-0 mr-4">
                                    {isCompleted ? (
                                        <Check className="h-6 w-6 text-green-600 mt-0.5" />
                                    ) : (
                                        <Square className="h-6 w-6 text-gray-400 mt-0.5" />
                                    )}
                                </div>
                                <div className="flex-grow">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-grow">
                                            <h3
                                                className={`text-base font-semibold ${
                                                    isCompleted ? 'text-gray-700 line-through' : 'text-gray-800'
                                                }`}
                                            >
                                                N{item.id}. {item.name}
                                            </h3>
                                            <p
                                                className={`text-sm mt-0.5 ${
                                                    isCompleted ? 'text-gray-500 line-through' : 'text-gray-600'
                                                }`}
                                            >
                                                {item.content}
                                            </p>
                                            {item.discord_url && (
                                                <div className="mt-2">
                                                    <a 
                                                        href={getDiscordUrl(item.discord_url)} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-lg hover:bg-indigo-100 hover:text-indigo-800 transition-all duration-200 border border-indigo-200 hover:border-indigo-300"
                                                        onClick={(e) => e.stopPropagation()} // 체크박스 클릭 방지
                                                    >
                                                        <MessageCircle className="h-3.5 w-3.5" />
                                                        <span>💡 Discord 팁</span>
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                        {item.point && (
                                            <div className="ml-3 flex-shrink-0">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                    isCompleted 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-indigo-100 text-indigo-800'
                                                }`}>
                                                    {item.point}P
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};
