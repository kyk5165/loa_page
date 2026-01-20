'use client';

import { useState } from 'react';
import { X, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthModal({ isOpen, onClose, initialMode = 'login', initialNickname = '' }) {
  const { login, register, setPassword } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'setPassword'
  const [nickname, setNickname] = useState(initialNickname);
  const [password, setPassword_] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const validateNickname = (value) => {
    if (value.length < 2) return '닉네임은 2자 이상이어야 합니다';
    if (value.length > 20) return '닉네임은 20자 이하여야 합니다';
    if (!/^[가-힣a-zA-Z0-9_]+$/.test(value)) {
      return '닉네임은 한글, 영문, 숫자, 언더스코어만 사용 가능합니다';
    }
    return null;
  };

  const validatePassword = (value) => {
    if (value.length < 8) return '비밀번호는 8자 이상이어야 합니다';
    if (value.length > 72) return '비밀번호는 72자 이하여야 합니다';
    if (!/(?=.*[A-Za-z])(?=.*\d)/.test(value)) {
      return '비밀번호는 영문과 숫자를 포함해야 합니다';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 유효성 검사
    if (mode !== 'login') {
      const nicknameError = validateNickname(nickname);
      if (nicknameError) {
        setError(nicknameError);
        return;
      }

      const passwordError = validatePassword(password);
      if (passwordError) {
        setError(passwordError);
        return;
      }

      if (password !== confirmPassword) {
        setError('비밀번호가 일치하지 않습니다');
        return;
      }
    }

    setIsLoading(true);

    try {
      let result;

      if (mode === 'login') {
        result = await login(nickname, password);
      } else if (mode === 'register') {
        result = await register(nickname, password);
      } else if (mode === 'setPassword') {
        result = await setPassword(nickname, password);
      }

      if (result.success) {
        onClose();
      } else {
        // 특별한 에러 처리
        if (result.error === 'NICKNAME_TAKEN') {
          setError('이미 등록된 닉네임입니다. 로그인을 이용하거나 다른 닉네임을 사용해주세요.');
        } else if (result.error === 'PASSWORD_NOT_SET') {
          setMode('setPassword');
          setError('');
        } else if (result.error === 'PASSWORD_ALREADY_SET') {
          setMode('login');
          setError('이미 비밀번호가 설정된 계정입니다. 로그인해주세요.');
        } else if (result.error === 'NICKNAME_NOT_FOUND') {
          setMode('register');
          setError('존재하지 않는 닉네임입니다. 회원가입을 진행해주세요.');
        } else {
          setError(result.message || '오류가 발생했습니다');
        }
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'login':
        return '로그인';
      case 'register':
        return '회원가입';
      case 'setPassword':
        return '비밀번호 설정';
      default:
        return '';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'login':
        return '닉네임과 비밀번호를 입력하세요';
      case 'register':
        return '새로운 계정을 만들어보세요';
      case 'setPassword':
        return '기존 데이터를 보호하기 위해 비밀번호를 설정하세요';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-white">{getTitle()}</h2>
            <p className="text-sm text-gray-400 mt-1">{getDescription()}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Nickname */}
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-300 mb-2">
              닉네임
            </label>
            <input
              type="text"
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임을 입력하세요"
              maxLength={20}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={mode === 'setPassword'}
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              비밀번호
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword_(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                maxLength={72}
                className="w-full px-4 py-3 pr-12 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {mode !== 'login' && (
              <p className="text-xs text-gray-500 mt-1">
                8자 이상, 영문과 숫자 포함
              </p>
            )}
          </div>

          {/* Confirm Password (only for register/setPassword) */}
          {mode !== 'login' && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                비밀번호 확인
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="비밀번호를 다시 입력하세요"
                maxLength={72}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                처리 중...
              </>
            ) : (
              getTitle()
            )}
          </button>

          {/* Mode Switch */}
          <div className="text-center text-sm text-gray-400">
            {mode === 'login' ? (
              <>
                계정이 없으신가요?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError('');
                  }}
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  회원가입
                </button>
              </>
            ) : (
              <>
                이미 계정이 있으신가요?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                  }}
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  로그인
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
