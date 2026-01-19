'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, LogOut, Plus, Pencil, Trash2, Search, Loader2, AlertTriangle, X, Lock } from 'lucide-react';
import { useAchievements, useCreateAchievement, useUpdateAchievement, useDeleteAchievement } from '../../hooks/useSupabaseQueries';
import { verifyAdminKey } from '../../lib/api';

// ====================================================================
// 메인 관리자 페이지
// ====================================================================
export default function AdminPage() {
    const [adminKey, setAdminKey] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    if (!isAuthenticated) {
        return (
            <PasswordScreen
                onAuthenticate={(key) => {
                    setAdminKey(key);
                    setIsAuthenticated(true);
                }}
            />
        );
    }

    return (
        <AdminPanel
            adminKey={adminKey}
            onLogout={() => {
                setAdminKey('');
                setIsAuthenticated(false);
            }}
        />
    );
}

// ====================================================================
// 비밀번호 입력 화면
// ====================================================================
const PasswordScreen = ({ onAuthenticate }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (!password.trim()) {
            setError('비밀번호를 입력해주세요.');
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            const { valid, status } = await verifyAdminKey(password.trim());

            if (valid) {
                onAuthenticate(password.trim());
            } else if (status === 403) {
                setError('비밀번호가 올바르지 않습니다.');
            } else if (status === 401) {
                setError('인증 정보가 누락되었습니다.');
            } else {
                setError('서버 오류가 발생했습니다. 다시 시도해주세요.');
            }
        } catch (err) {
            setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            setIsLoading(false);
        }
    }, [password, onAuthenticate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm">
                <div className="flex items-center justify-center mb-6">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Lock className="h-6 w-6 text-indigo-600" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold mb-2 text-gray-800 text-center">관리자 인증</h2>
                <p className="text-sm text-gray-500 mb-6 text-center">관리자 비밀번호를 입력하세요.</p>

                <div className="mb-4">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        비밀번호
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="관리자 비밀번호"
                        disabled={isLoading}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-900 placeholder-gray-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${error ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            확인 중...
                        </span>
                    ) : (
                        '로그인'
                    )}
                </button>

                <Link
                    href="/"
                    className="mt-4 block text-center text-sm text-gray-500 hover:text-indigo-600 transition"
                >
                    ← 메인으로 돌아가기
                </Link>
            </form>
        </div>
    );
};

// ====================================================================
// 관리자 패널
// ====================================================================
const AdminPanel = ({ adminKey, onLogout }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [editingAchievement, setEditingAchievement] = useState(null);
    const [deletingAchievement, setDeletingAchievement] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);

    const { data: achievements = [], isLoading, error } = useAchievements();

    const filteredAchievements = useMemo(() => {
        if (!searchTerm) return achievements;
        const term = searchTerm.toLowerCase();
        return achievements.filter(
            (a) => a.name.toLowerCase().includes(term) || a.content.toLowerCase().includes(term)
        );
    }, [achievements, searchTerm]);

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <div className="w-full max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-6 sm:p-8">
                {/* 헤더 */}
                <header className="mb-8 border-b pb-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">업적 관리자</h1>
                        <p className="text-sm text-gray-500 mt-1">업적 데이터를 추가, 수정, 삭제할 수 있습니다.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            className="flex items-center text-sm text-gray-500 hover:text-indigo-600 transition duration-150 p-2 rounded-full hover:bg-indigo-50"
                            title="메인으로"
                        >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            메인으로
                        </Link>
                        <button
                            onClick={onLogout}
                            className="flex items-center text-sm text-gray-500 hover:text-red-600 transition duration-150 p-2 rounded-full hover:bg-red-50"
                            title="로그아웃"
                        >
                            <LogOut className="h-4 w-4 mr-1" />
                            로그아웃
                        </button>
                    </div>
                </header>

                {/* 새 업적 추가 버튼 */}
                <div className="mb-6">
                    <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        새 업적 추가
                    </button>
                </div>

                {/* 생성 폼 */}
                {showCreateForm && (
                    <CreateAchievementForm
                        adminKey={adminKey}
                        onClose={() => setShowCreateForm(false)}
                    />
                )}

                {/* 검색 */}
                <div className="mb-6">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="업적 이름 또는 내용을 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-900 placeholder-gray-500 bg-white shadow-sm"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                </div>

                {/* 업적 테이블 */}
                <AchievementTable
                    achievements={filteredAchievements}
                    isLoading={isLoading}
                    error={error}
                    onEdit={setEditingAchievement}
                    onDelete={setDeletingAchievement}
                />

                {/* 수정 모달 */}
                {editingAchievement && (
                    <EditModal
                        achievement={editingAchievement}
                        adminKey={adminKey}
                        onClose={() => setEditingAchievement(null)}
                    />
                )}

                {/* 삭제 확인 모달 */}
                {deletingAchievement && (
                    <DeleteConfirmModal
                        achievement={deletingAchievement}
                        adminKey={adminKey}
                        onClose={() => setDeletingAchievement(null)}
                    />
                )}
            </div>
        </div>
    );
};

// ====================================================================
// 업적 생성 폼
// ====================================================================
const CreateAchievementForm = ({ adminKey, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        content: '',
        point: 20,
        discord_url: '',
        is_legacy: false,
    });
    const [error, setError] = useState('');

    const createMutation = useCreateAchievement();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.name.trim()) {
            setError('업적 이름을 입력해주세요.');
            return;
        }
        if (!formData.content.trim()) {
            setError('업적 내용을 입력해주세요.');
            return;
        }

        try {
            await createMutation.mutateAsync({
                adminKey,
                achievement: {
                    name: formData.name.trim(),
                    content: formData.content.trim(),
                    point: Number(formData.point) || 0,
                    discord_url: formData.discord_url.trim() || null,
                    is_legacy: formData.is_legacy,
                },
            });
            setFormData({ name: '', content: '', point: 20, discord_url: '', is_legacy: false });
            onClose();
        } catch (err) {
            setError(err.message || '업적 생성에 실패했습니다.');
        }
    };

    return (
        <div className="mb-6 p-6 bg-indigo-50 rounded-xl border border-indigo-200">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">새 업적 추가</h3>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            업적 이름 *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                            placeholder="업적 이름"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            포인트
                        </label>
                        <input
                            type="number"
                            value={formData.point}
                            onChange={(e) => setFormData({ ...formData, point: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                            placeholder="0"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        업적 내용 *
                    </label>
                    <textarea
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                        placeholder="업적 달성 조건 또는 설명"
                        rows={3}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Discord URL (선택)
                    </label>
                    <input
                        type="text"
                        value={formData.discord_url}
                        onChange={(e) => setFormData({ ...formData, discord_url: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                        placeholder="예: 1234567890/1234567890"
                    />
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="create-is-legacy"
                        checked={formData.is_legacy}
                        onChange={(e) => setFormData({ ...formData, is_legacy: e.target.checked })}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="create-is-legacy" className="ml-2 block text-sm text-gray-700">
                        레거시 업적 (더 이상 달성 불가능하거나 삭제된 컨텐츠)
                    </label>
                </div>

                {error && (
                    <div className="p-3 bg-red-100 text-red-800 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium"
                    >
                        취소
                    </button>
                    <button
                        type="submit"
                        disabled={createMutation.isPending}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50"
                    >
                        {createMutation.isPending ? (
                            <span className="flex items-center">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                저장 중...
                            </span>
                        ) : (
                            '추가'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

// ====================================================================
// 업적 테이블
// ====================================================================
const AchievementTable = ({ achievements, isLoading, error, onEdit, onDelete }) => {
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
            <div className="p-4 bg-red-100 text-red-800 border-l-4 border-red-500 rounded-md">
                <p className="font-semibold">에러 발생</p>
                <p className="text-sm">{error.message || error.toString()}</p>
            </div>
        );
    }

    if (achievements.length === 0) {
        return (
            <div className="text-center p-10 text-gray-500 bg-gray-50 rounded-xl">
                <p>등록된 업적이 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">이름</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">내용</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">포인트</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">상태</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">액션</th>
                    </tr>
                </thead>
                <tbody>
                    {achievements.map((achievement) => (
                        <tr key={achievement.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-600">{achievement.id}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-[200px] truncate">
                                {achievement.name}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 max-w-[300px] truncate">
                                {achievement.content}
                            </td>
                            <td className="px-4 py-3 text-center">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    achievement.point > 0 ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-600'
                                }`}>
                                    {achievement.point}P
                                </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                                {achievement.is_legacy ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                        레거시
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        활성
                                    </span>
                                )}
                            </td>
                            <td className="px-4 py-3 text-center">
                                <div className="flex justify-center gap-2">
                                    <button
                                        onClick={() => onEdit(achievement)}
                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                        title="수정"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(achievement)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                        title="삭제"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="mt-4 text-sm text-gray-500 text-right">
                총 {achievements.length}개의 업적
            </div>
        </div>
    );
};

// ====================================================================
// 수정 모달
// ====================================================================
const EditModal = ({ achievement, adminKey, onClose }) => {
    const [formData, setFormData] = useState({
        name: achievement.name,
        content: achievement.content,
        point: achievement.point,
        discord_url: achievement.discord_url || '',
        is_legacy: achievement.is_legacy || false,
    });
    const [error, setError] = useState('');

    const updateMutation = useUpdateAchievement();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.name.trim()) {
            setError('업적 이름을 입력해주세요.');
            return;
        }
        if (!formData.content.trim()) {
            setError('업적 내용을 입력해주세요.');
            return;
        }

        try {
            await updateMutation.mutateAsync({
                adminKey,
                id: achievement.id,
                updates: {
                    name: formData.name.trim(),
                    content: formData.content.trim(),
                    point: Number(formData.point) || 0,
                    discord_url: formData.discord_url.trim() || null,
                    is_legacy: formData.is_legacy,
                },
            });
            onClose();
        } catch (err) {
            setError(err.message || '업적 수정에 실패했습니다.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">업적 수정</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            업적 이름 *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            업적 내용 *
                        </label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                            rows={3}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            포인트
                        </label>
                        <input
                            type="number"
                            value={formData.point}
                            onChange={(e) => setFormData({ ...formData, point: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Discord URL (선택)
                        </label>
                        <input
                            type="text"
                            value={formData.discord_url}
                            onChange={(e) => setFormData({ ...formData, discord_url: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                            placeholder="예: 1234567890/1234567890"
                        />
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="edit-is-legacy"
                            checked={formData.is_legacy}
                            onChange={(e) => setFormData({ ...formData, is_legacy: e.target.checked })}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="edit-is-legacy" className="ml-2 block text-sm text-gray-700">
                            레거시 업적 (더 이상 달성 불가능하거나 삭제된 컨텐츠)
                        </label>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-100 text-red-800 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={updateMutation.isPending}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50"
                        >
                            {updateMutation.isPending ? (
                                <span className="flex items-center">
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    저장 중...
                                </span>
                            ) : (
                                '저장'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ====================================================================
// 삭제 확인 모달
// ====================================================================
const DeleteConfirmModal = ({ achievement, adminKey, onClose }) => {
    const [error, setError] = useState('');
    const deleteMutation = useDeleteAchievement();

    const handleDelete = async () => {
        setError('');
        try {
            await deleteMutation.mutateAsync({
                adminKey,
                id: achievement.id,
            });
            onClose();
        } catch (err) {
            setError(err.message || '업적 삭제에 실패했습니다.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">업적 삭제</h3>
                        <p className="text-sm text-gray-500">이 작업은 되돌릴 수 없습니다</p>
                    </div>
                </div>

                <div className="mb-6">
                    <p className="text-gray-700 mb-2">
                        다음 업적을 삭제하시겠습니까?
                    </p>
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium text-gray-900">{achievement.name}</p>
                        <p className="text-sm text-gray-600 mt-1">{achievement.content}</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <div className="flex space-x-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition duration-200 font-medium"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={deleteMutation.isPending}
                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200 font-medium disabled:opacity-50"
                    >
                        {deleteMutation.isPending ? (
                            <span className="flex items-center justify-center">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                삭제 중...
                            </span>
                        ) : (
                            '삭제'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
