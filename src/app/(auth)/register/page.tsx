'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Turnstile } from '@marsidev/react-turnstile';
import { toast } from 'sonner';

const SITE_KEY = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY || '0x4AAAAAAE_tRnhkFTTA3m91';

export default function RegisterPage() {
	const router = useRouter();
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [phone, setPhone] = useState('');
	const [password, setPassword] = useState('');
	const [passwordConfirmation, setPasswordConfirmation] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
	const [turnstileToken, setTurnstileToken] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!name.trim() || !email.trim() || !phone.trim() || !password || !passwordConfirmation) {
			toast.warning('Vui lòng nhập đầy đủ thông tin đăng ký');
			return;
		}
		if (password.length < 6) {
			toast.warning('Mật khẩu phải có ít nhất 6 ký tự');
			return;
		}
		if (password !== passwordConfirmation) {
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
				body: JSON.stringify({ full_name: name.trim(), email: email.trim(), phone: phone.trim(), password, turnstile_token: turnstileToken }),
			});
			const data = await response.json().catch(() => ({}));
			if (!response.ok) throw new Error(data.detail || data.message || 'Đăng ký thất bại!');
			toast.success('Đăng ký thành công! Đang chuyển đến trang đăng nhập...');
			router.push('/login');
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Đăng ký thất bại!');
			setTurnstileToken('');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<main className="w-full min-h-[calc(100vh-130px)] flex items-center justify-center py-8 px-4 font-['Signika',sans-serif]">
			<section className="w-full max-w-lg rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
				<div className="mb-6 text-center">
					<p className="text-xs font-bold uppercase tracking-wider text-[#d70018]">Tạo tài khoản</p>
					<h1 className="mt-2 text-2xl font-black text-slate-900">Đăng ký thành viên</h1>
					<p className="mt-2 text-sm text-slate-500">Nhập thông tin để bắt đầu mua sắm.</p>
				</div>
				<form className="space-y-4" onSubmit={handleSubmit}>
					<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Họ tên" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none focus:border-[#d70018]" />
					<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none focus:border-[#d70018]" />
					<input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Số điện thoại" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none focus:border-[#d70018]" />
					<div className="relative">
						<input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mật khẩu tối thiểu 6 ký tự" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 pr-14 text-sm outline-none focus:border-[#d70018]" />
						<button type="button" onClick={() => setShowPassword((isVisible) => !isVisible)} aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} tabIndex={-1} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"><i className={showPassword ? 'ri-eye-off-line text-lg' : 'ri-eye-line text-lg'} aria-hidden="true" /></button>
					</div>
					<div className="relative">
						<input type={showPasswordConfirmation ? 'text' : 'password'} value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} placeholder="Nhập lại mật khẩu" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 pr-14 text-sm outline-none focus:border-[#d70018]" />
						<button type="button" onClick={() => setShowPasswordConfirmation((isVisible) => !isVisible)} aria-label={showPasswordConfirmation ? 'Ẩn mật khẩu xác nhận' : 'Hiện mật khẩu xác nhận'} tabIndex={-1} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"><i className={showPasswordConfirmation ? 'ri-eye-off-line text-lg' : 'ri-eye-line text-lg'} aria-hidden="true" /></button>
					</div>
					<div className="flex justify-center py-1"><Turnstile siteKey={SITE_KEY} onSuccess={setTurnstileToken} options={{ theme: 'light', size: 'flexible' }} /></div>
					<button type="submit" disabled={isLoading} className="w-full rounded-xl bg-[#d70018] py-3 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-[#bf0015] disabled:cursor-not-allowed disabled:opacity-60">{isLoading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG KÝ'}</button>
				</form>
				<p className="mt-5 text-center text-sm text-slate-500">Đã có tài khoản? <Link href="/login" className="font-bold text-[#d70018] hover:underline">Đăng nhập ngay</Link></p>
			</section>
		</main>
	);
}
