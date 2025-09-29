'use client'; // Next.js 클라이언트 컴포넌트임을 알림

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Check, Square, Search, Filter, Loader2, LogOut, ArrowLeft } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// ====================================================================
// 1. Supabase 클라이언트 초기화
// ====================================================================
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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
// 3. 메인 페이지 컴포넌트
// ====================================================================
export default function App() {
    const [nickname, setNickname] = useState('');
    const [allAchievements, setAllAchievements] = useState([]);
    const [progress, setProgress] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [isMounted, setIsMounted] = useState(false);

    // 닉네임 로컬스토리지에서 불러오기
    useEffect(() => {
        const storedNickname = localStorage.getItem('checklist_nickname');
        if (storedNickname) {
            setNickname(storedNickname);
        }
        setIsMounted(true);
    }, []);

    // ----------------------------------------------------------------
    // 4. 데이터 로드 (업적 목록 + 사용자 진행 상황)
    // ----------------------------------------------------------------
    const fetchUserProgress = useCallback(async (currentNickname) => {
        setIsLoading(true);
        setError(null);

        if (!currentNickname || !SUPABASE_URL?.startsWith('http')) {
            setError("Supabase 설정이 필요합니다. 환경 변수를 확인해주세요.");
            setIsLoading(false);
            return;
        }

        try {
            // 1. 전체 업적 목록 가져오기
            const { data: achievements, error: achError } = await supabase
                .from('achievements')
                .select('id, name, content')
                .order('id', { ascending: true });

            if (achError) throw achError;
            setAllAchievements(achievements);

            // 2. 사용자 진행 상황 가져오기
            const { data: userProgress, error: progError } = await supabase
                .from('user_progress')
                .select('id, achievement_id, is_completed')
                .eq('nickname', currentNickname);

            if (progError) throw progError;

            // 3. 병합
            const mergedList = achievements.map((ach) => {
                const userStatus = userProgress.find((p) => p.achievement_id === ach.id);
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
    }, []);

    useEffect(() => {
        if (nickname && isMounted) {
            fetchUserProgress(nickname);
        }
    }, [nickname, fetchUserProgress, isMounted]);

    // ----------------------------------------------------------------
    // 5. 진행 상황 토글 (Upsert 사용)
    // ----------------------------------------------------------------
    const toggleCompletion = useCallback(async (achievementId, currentStatus) => {
        const newStatus = !currentStatus;

        // 로컬 상태 업데이트 (UX 개선)
        setProgress(prev =>
            prev.map(a => a.id === achievementId ? { ...a, is_completed: newStatus } : a)
        );

        if (!nickname || !SUPABASE_URL?.startsWith('http')) {
            console.warn('Supabase 미설정. 로컬 상태만 변경됨.');
            return;
        }

        try {
            const { error: upsertError } = await supabase
                .from('user_progress')
                .upsert(
                    {
                        nickname,
                        achievement_id: achievementId,
                        is_completed: newStatus,
                    },
                    { onConflict: 'nickname,achievement_id' }
                );

            if (upsertError) throw upsertError;
        } catch (err) {
            console.error('Error updating progress:', err);
            setError(`업데이트 실패: ${err.message}`);
            // 실패 시 롤백
            setProgress(prev =>
                prev.map(a => a.id === achievementId ? { ...a, is_completed: currentStatus } : a)
            );
        }
    }, [nickname]);

    // ----------------------------------------------------------------
    // 6. 필터링 + 검색
    // ----------------------------------------------------------------
    const filteredAndSearchedList = useMemo(() => {
        let list = progress;
        if (filter === 'completed') {
            list = list.filter(item => item.is_completed);
        } else if (filter === 'incomplete') {
            list = list.filter(item => !item.is_completed);
        }
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            list = list.filter(item =>
                item.name.toLowerCase().includes(term) ||
                item.content.toLowerCase().includes(term)
            );
        }
        return list;
    }, [progress, filter, searchTerm]);

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
                        <h1 className="text-3xl font-bold text-gray-800">나의 업적 체크리스트</h1>
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
                />

                <Checklist
                    list={filteredAndSearchedList}
                    toggleCompletion={toggleCompletion}
                    isLoading={isLoading}
                    error={error}
                    totalCount={allAchievements.length}
                    completedCount={progress.filter(a => a.is_completed).length}
                />
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

const Controls = React.memo(({ searchTerm, setSearchTerm, filter, setFilter }) => {
    const filters = [
        { key: 'all', label: '전체' },
        { key: 'completed', label: '완료' },
        { key: 'incomplete', label: '미완료' },
    ];

    const debouncedSetSearchTerm = useMemo(() => debounce(setSearchTerm, 300), [setSearchTerm]);

    return (
        <div className="mb-6 space-y-4 md:space-y-0 md:flex md:gap-4">
            <div className="relative flex-grow">
                <input
                    type="text"
                    placeholder="업적 이름 또는 내용을 검색..."
                    onChange={(e) => debouncedSetSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition"
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
        </div>
    );
});

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
                <p className="text-lg font-semibold text-indigo-700">
                    진행률: {completedCount} / {totalCount} ({completionRate}%)
                </p>
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
                            className={`flex items-start p-4 rounded-xl transition duration-200 cursor-pointer border ${
                                item.is_completed
                                    ? 'bg-green-50 border-green-200 shadow-sm'
                                    : 'bg-white border-gray-200 hover:border-indigo-300'
                            }`}
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
                                <h3
                                    className={`text-base font-semibold ${
                                        item.is_completed ? 'text-gray-700 line-through' : 'text-gray-800'
                                    }`}
                                >
                                    N{item.id}. {item.name}
                                </h3>
                                <p
                                    className={`text-sm mt-0.5 ${
                                        item.is_completed ? 'text-gray-500 line-through' : 'text-gray-600'
                                    }`}
                                >
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
