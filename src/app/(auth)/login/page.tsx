'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';
import { toast } from 'sonner';

type AuthMode = 'login' | 'register' | 'forgot';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerOtp, setRegisterOtp] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerPasswordConfirmation, setRegisterPasswordConfirmation] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterPasswordConfirmation, setShowRegisterPasswordConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const turnstileRef = useRef<TurnstileInstance>(null);

  // Site Key Cloudflare Turnstile
  const SITE_KEY =
    process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY || '0x4AAAAAAE_tRnhkFTTA3m91';

  const switchMode = (newMode: AuthMode) => {
    if (newMode === mode) return;
    setTurnstileToken('');
    turnstileRef.current?.reset();
    setMode(newMode);
  };

  const handleLoginSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (!email.trim() || !password) {
      toast.warning('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    if (!turnstileToken) {
      toast.warning('Vui lòng hoàn tất xác thực Turnstile CAPTCHA');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: email.trim(),
          password,
          turnstile_token: turnstileToken,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.detail || data.message || data.error || 'Đăng nhập thất bại.');
      }

      if (data.access_token) localStorage.setItem('access_token', data.access_token);
      if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token);
      toast.success('Đăng nhập thành công! Đang chuyển hướng...');
      await new Promise((resolve) => setTimeout(resolve, 5000));
      if (data.user) {
        localStorage.setItem('user_info', JSON.stringify(data.user));
        window.dispatchEvent(new Event('auth-state-changed'));
      }
      router.push('/profile');
    } catch (error) {
      const message = error instanceof Error ? error.message : undefined;
      toast.error(message || 'Đăng nhập thất bại!');
      setTurnstileToken('');
      turnstileRef.current?.reset();
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (!registerName.trim() || !registerEmail.trim() || !registerPhone.trim() || !registerPassword || !registerPasswordConfirmation) {
      toast.warning('Vui lòng nhập đầy đủ thông tin đăng ký');
      return;
    }

    if (registerPassword.length < 6) {
      toast.warning('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (registerPassword !== registerPasswordConfirmation) {
      toast.warning('Mật khẩu xác nhận không khớp');
      return;
    }

    if (!turnstileToken) {
      toast.warning('Vui lòng hoàn tất xác thực Turnstile CAPTCHA');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: registerName.trim(),
          email: registerEmail.trim(),
          phone: registerPhone.trim(),
          otp: registerOtp.trim(),
          password: registerPassword,
          turnstile_token: turnstileToken,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Đăng ký thất bại!');
      }

      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      setEmail(registerEmail.trim());
      setPassword('');
      setRegisterPassword('');
      setRegisterPasswordConfirmation('');
      setTurnstileToken('');
      turnstileRef.current?.reset();
      setMode('login');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Đăng ký thất bại!');
      setTurnstileToken('');
      turnstileRef.current?.reset();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-130px)] flex items-center justify-center py-4 px-4 font-['Signika',sans-serif]">
      {/* Khung ngoài max-w-[1250px] ăn khớp tuyệt đối với Header và Slider */}
      <div className="relative w-full max-w-[1250px] h-[630px] bg-white rounded-3xl overflow-hidden border border-slate-100 grid grid-cols-1 md:grid-cols-12 -translate-y-[11px]">
        
        {/* =========================================================================
            CỘT TRÁI: FORM NỘI DUNG ĐÃ DÃN RỘNG RA max-w-[540px]
            ========================================================================= */}
        <div className="md:col-span-7 px-6 sm:px-12 py-6 flex flex-col justify-center relative overflow-hidden">
          
          {/* 1. FORM ĐĂNG NHẬP */}
          <div
            className={`w-full max-w-[520px] mx-auto transition-all duration-500 ease-out will-change-transform ${
              mode === 'login'
                ? 'opacity-100 translate-x-0 relative z-10 pointer-events-auto'
                : 'opacity-0 -translate-x-12 absolute pointer-events-none'
            }`}
          >
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1.5">
                  EMAIL
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Nhập email của bạn"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#d70018] focus:ring-1 focus:ring-[#d70018] bg-slate-50/50 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1.5">
                  MẬT KHẨU
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Nhập mật khẩu"
                    className="w-full pl-12 pr-12 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#d70018] focus:ring-1 focus:ring-[#d70018] bg-slate-50/50 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword((isVisible) => !isVisible)}
                    aria-label={showLoginPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    <i className={showLoginPassword ? 'ri-eye-off-line text-lg' : 'ri-eye-line text-lg'} aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#d70018] accent-[#d70018] cursor-pointer" />
                  <span>Ghi nhớ đăng nhập</span>
                </label>
                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  className="text-[#d70018] hover:underline font-bold cursor-pointer"
                >
                  Quên mật khẩu?
                </button>
              </div>

              {/* Cloudflare Turnstile */}
              <div className="flex justify-center pt-1 min-h-[66px]">
                {mode === 'login' && (
                  <Turnstile
                    key="turnstile-login"
                    ref={turnstileRef}
                    siteKey={SITE_KEY}
                    onSuccess={(token) => setTurnstileToken(token)}
                    options={{ theme: 'light', size: 'flexible' }}
                  />
                )}
              </div>

              <button
                type="button"
                onClick={handleLoginSubmit}
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-[#d70018] text-white font-bold text-sm tracking-wider uppercase shadow-sm hover:bg-[#bf0015] active:scale-[0.99] transition cursor-pointer"
              >
                {isLoading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG NHẬP'}
              </button>

              <div className="relative my-2 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <span className="relative bg-white px-3 text-xs text-slate-400 uppercase font-semibold">hoặc</span>
              </div>

              <button
                type="button"
                className="w-full py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold flex items-center justify-center gap-2.5 hover:bg-slate-50 transition cursor-pointer"
              >
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Đăng nhập bằng Google
              </button>

              <div className="text-center pt-0.5 text-xs sm:text-sm text-slate-500">
                Chưa có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="text-[#d70018] font-bold hover:underline cursor-pointer"
                >
                  Đăng ký ngay
                </button>
              </div>
            </div>
          </div>

          {/* 2. FORM ĐĂNG KÝ: DÃN RỘNG 540PX RÕ RÀNG */}
          <div
            className={`w-full max-w-[520px] mx-auto transition-all duration-500 ease-out will-change-transform ${
              mode === 'register'
                ? 'opacity-100 translate-x-0 relative z-10 pointer-events-auto'
                : 'opacity-0 translate-x-12 absolute pointer-events-none'
            }`}
          >
            <div className="space-y-2.5">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1">
                  HỌ TÊN
                </label>
                <input
                  type="text"
                  value={registerName}
                  onChange={(event) => setRegisterName(event.target.value)}
                  placeholder="Nhập họ tên đầy đủ"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#d70018] bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1">
                  EMAIL
                </label>
                <div className="flex gap-2.5">
                  <input
                    type="email"
                    value={registerEmail}
                    onChange={(event) => setRegisterEmail(event.target.value)}
                    placeholder="Nhập email"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#d70018] bg-slate-50/50"
                  />
                  <button
                    type="button"
                    className="shrink-0 px-5 py-2.5 rounded-xl bg-[#d70018] text-white text-xs sm:text-sm font-bold hover:bg-[#bf0015] transition cursor-pointer"
                  >
                    Lấy mã
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1">
                    MÃ OTP
                  </label>
                  <input
                    type="text"
                    value={registerOtp}
                    onChange={(event) => setRegisterOtp(event.target.value)}
                    placeholder="Mã về email"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#d70018] bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1">
                    SỐ ĐIỆN THOẠI
                  </label>
                  <input
                    type="tel"
                    value={registerPhone}
                    onChange={(event) => setRegisterPhone(event.target.value)}
                    placeholder="Số điện thoại"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#d70018] bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1">
                    MẬT KHẨU
                  </label>
                  <div className="relative">
                    <input
                      type={showRegisterPassword ? 'text' : 'password'}
                      value={registerPassword}
                      onChange={(event) => setRegisterPassword(event.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full px-4 pr-12 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#d70018] bg-slate-50/50"
                    />
                    <button type="button" onClick={() => setShowRegisterPassword((isVisible) => !isVisible)} aria-label={showRegisterPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} tabIndex={-1} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                      <i className={showRegisterPassword ? 'ri-eye-off-line text-lg' : 'ri-eye-line text-lg'} aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1">
                    NHẬP LẠI MẬT KHẨU
                  </label>
                  <div className="relative">
                    <input
                      type={showRegisterPasswordConfirmation ? 'text' : 'password'}
                      value={registerPasswordConfirmation}
                      onChange={(event) => setRegisterPasswordConfirmation(event.target.value)}
                      placeholder="Nhập lại MK"
                      className="w-full px-4 pr-12 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#d70018] bg-slate-50/50"
                    />
                    <button type="button" onClick={() => setShowRegisterPasswordConfirmation((isVisible) => !isVisible)} aria-label={showRegisterPasswordConfirmation ? 'Ẩn mật khẩu xác nhận' : 'Hiện mật khẩu xác nhận'} tabIndex={-1} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                      <i className={showRegisterPasswordConfirmation ? 'ri-eye-off-line text-lg' : 'ri-eye-line text-lg'} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Cloudflare Turnstile */}
              <div className="flex justify-center pt-1 min-h-[66px]">
                {mode === 'register' && (
                  <Turnstile
                    key="turnstile-register"
                    siteKey={SITE_KEY}
                    onSuccess={(token) => setTurnstileToken(token)}
                    options={{ theme: 'light', size: 'flexible' }}
                  />
                )}
              </div>

              <button
                type="button"
                onClick={handleRegisterSubmit}
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-[#d70018] text-white font-bold text-sm tracking-wider uppercase shadow hover:bg-[#bf0015] active:scale-[0.99] transition cursor-pointer"
              >
                ĐĂNG KÝ
              </button>

              <div className="text-center pt-0.5 text-xs sm:text-sm text-slate-500">
                Đã có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-[#d70018] font-bold hover:underline cursor-pointer"
                >
                  Đăng nhập ngay
                </button>
              </div>
            </div>
          </div>

          {/* 3. FORM QUÊN MẬT KHẨU */}
          <div
            className={`w-full max-w-[520px] mx-auto transition-all duration-500 ease-out will-change-transform ${
              mode === 'forgot'
                ? 'opacity-100 translate-x-0 relative z-10 pointer-events-auto'
                : 'opacity-0 translate-x-12 absolute pointer-events-none'
            }`}
          >
            <div className="flex items-center justify-center gap-4 mb-7">
              <span className="flex items-center gap-2 text-sm font-bold text-[#d70018]">
                <span className="w-6 h-6 rounded-full bg-[#d70018] text-white flex items-center justify-center text-xs">1</span>
                Email
              </span>
              <span className="text-slate-300 font-bold">-----</span>
              <span className="flex items-center gap-2 text-sm font-medium text-slate-400">
                <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs">2</span>
                OTP
              </span>
              <span className="text-slate-300 font-bold">-----</span>
              <span className="flex items-center gap-2 text-sm font-medium text-slate-400">
                <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs">3</span>
                Mật khẩu
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1.5">
                  EMAIL ĐÃ ĐĂNG KÝ
                </label>
                <div className="flex gap-2.5">
                  <input
                    type="email"
                    placeholder="Nhập email đã đăng ký"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#d70018] bg-slate-50/50"
                  />
                  <button
                    type="button"
                    className="shrink-0 px-6 py-3 rounded-xl bg-[#d70018] text-white text-sm font-bold hover:bg-[#bf0015] transition cursor-pointer"
                  >
                    Gửi mã
                  </button>
                </div>
              </div>

              {/* Cloudflare Turnstile */}
              <div className="flex justify-center pt-1 min-h-[66px]">
                {mode === 'forgot' && (
                  <Turnstile
                    key="turnstile-forgot"
                    siteKey={SITE_KEY}
                    onSuccess={(token) => setTurnstileToken(token)}
                    options={{ theme: 'light', size: 'flexible' }}
                  />
                )}
              </div>

              <div className="pt-3 text-center">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-sm text-slate-600 hover:text-[#d70018] font-bold transition flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                >
                  Quay lại đăng nhập
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            CỘT PHẢI: BANNER THÔNG TIN RỘNG RÃI
            ========================================================================= */}
        <div className="hidden md:flex md:col-span-5 bg-gradient-to-br from-[#fff5f5] to-[#ffeded] p-10 flex-col justify-center items-center text-center border-l border-red-50 relative overflow-hidden h-full">
          
          <div className="relative z-10 max-w-[320px]">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#d70018] border border-red-100 transition-transform duration-300">
              {mode === 'login' && (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              )}
              {mode === 'register' && (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              )}
              {mode === 'forgot' && (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              )}
            </div>

            <h3 className="text-xl font-black uppercase text-slate-800 tracking-wider transition-all duration-300">
              {mode === 'login' && 'ĐĂNG NHẬP!'}
              {mode === 'register' && 'TẠO TÀI KHOẢN!'}
              {mode === 'forgot' && 'KHÔI PHỤC TÀI KHOẢN'}
            </h3>

            <p className="text-xs text-slate-500 mt-2 mb-6 leading-relaxed min-h-[36px]">
              {mode === 'login' && 'Đăng nhập để trải nghiệm mua sắm thông minh.'}
              {mode === 'register' && 'Tạo tài khoản để khám phá sản phẩm công nghệ.'}
              {mode === 'forgot' && 'Chỉ sau một vài bước đơn giản để lấy lại quyền truy cập.'}
            </p>

            <div className="space-y-3.5 text-left">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-600">
                <span className="w-5 h-5 rounded-full bg-red-100 text-[#d70018] flex items-center justify-center text-xs shrink-0 font-bold">✓</span>
                <span>Ưu đãi đặc quyền thành viên</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-600">
                <span className="w-5 h-5 rounded-full bg-red-100 text-[#d70018] flex items-center justify-center text-xs shrink-0 font-bold">✓</span>
                <span>Theo dõi đơn hàng thời gian thực</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-600">
                <span className="w-5 h-5 rounded-full bg-red-100 text-[#d70018] flex items-center justify-center text-xs shrink-0 font-bold">✓</span>
                <span>Lịch sử và tích điểm mua sắm</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}