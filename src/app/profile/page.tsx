'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type ProfileTab = 'dashboard' | 'address' | 'password' | 'student' | 'coupon' | 'history' | 'refund';

interface UserProfile {
  id?: string | number;
  name: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  rank: 'bronze' | 'silver' | 'gold' | 'diamond';
  isSuperuser?: boolean;
}

interface Address {
  id: number;
  name: string;
  phone: string;
  province: string;
  detail: string;
  isDefault: boolean;
}

interface PasswordHistory {
  id: number;
  changedAt: string;
  ipAddress: string;
}

interface ProvinceItem {
  id: string;
  name: string;
}

interface CommuneItem {
  id: string;
  name: string;
}

type ConfirmationAction =
  | { type: 'logout' }
  | { type: 'delete-address'; addressId: number }
  | null;

// Danh mục Tỉnh/Thành phố toàn quốc
const DEFAULT_PROVINCES: ProvinceItem[] = [
  { id: '01', name: 'Thành phố Hà Nội' },
  { id: '04', name: 'Tỉnh Cao Bằng' },
  { id: '20', name: 'Tỉnh Lạng Sơn' },
  { id: '22', name: 'Tỉnh Quảng Ninh' },
  { id: '19', name: 'Tỉnh Thái Nguyên' },
  { id: '08', name: 'Tỉnh Tuyên Quang' },
  { id: '25', name: 'Tỉnh Phú Thọ' },
  { id: '10', name: 'Tỉnh Lào Cai' },
  { id: '11', name: 'Tỉnh Điện Biên' },
  { id: '12', name: 'Tỉnh Lai Châu' },
  { id: '14', name: 'Tỉnh Sơn La' },
  { id: '27', name: 'Tỉnh Bắc Ninh' },
  { id: '33', name: 'Tỉnh Hưng Yên' },
  { id: '37', name: 'Tỉnh Ninh Bình' },
  { id: '31', name: 'Thành phố Hải Phòng' },
  { id: '38', name: 'Tỉnh Thanh Hóa' },
  { id: '40', name: 'Tỉnh Nghệ An' },
  { id: '42', name: 'Tỉnh Hà Tĩnh' },
  { id: '45', name: 'Tỉnh Quảng Trị' },
  { id: '46', name: 'Thành phố Huế' },
  { id: '48', name: 'Thành phố Đà Nẵng' },
  { id: '51', name: 'Tỉnh Quảng Ngãi' },
  { id: '52', name: 'Tỉnh Gia Lai' },
  { id: '66', name: 'Tỉnh Đắk Lắk' },
  { id: '56', name: 'Tỉnh Khánh Hòa' },
  { id: '68', name: 'Tỉnh Lâm Đồng' },
  { id: '75', name: 'Tỉnh Đồng Nai' },
  { id: '80', name: 'Tỉnh Tây Ninh' },
  { id: '79', name: 'Thành phố Hồ Chí Minh' },
  { id: '82', name: 'Tỉnh Đồng Tháp' },
  { id: '86', name: 'Tỉnh Vĩnh Long' },
  { id: '91', name: 'Tỉnh An Giang' },
  { id: '96', name: 'Tỉnh Cà Mau' },
  { id: '92', name: 'Thành phố Cần Thơ' },
];

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ProfileTab>('address');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressPage, setAddressPage] = useState(1);
  const [passwordHistory, setPasswordHistory] = useState<PasswordHistory[]>([]);
  const [passwordPage, setPasswordPage] = useState(1);

  // State theo chuẩn hành chính 2 cấp (Tỉnh -> Xã/Phường)
  const [provinces, setProvinces] = useState<ProvinceItem[]>(DEFAULT_PROVINCES);
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('');
  const [communes, setCommunes] = useState<CommuneItem[]>([]);
  const [isLoadingCommunes, setIsLoadingCommunes] = useState<boolean>(false);

  // Loading States cho các tác vụ async
  const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);
  const [settingDefaultId, setSettingDefaultId] = useState<number | null>(null);
  const [isDeletingAddress, setIsDeletingAddress] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [confirmationAction, setConfirmationAction] = useState<ConfirmationAction>(null);

  const [user, setUser] = useState<UserProfile>({
    id: 'dev-admin',
    name: 'ADMIN',
    email: 'admin@hotmail.com',
    totalOrders: 2,
    totalSpent: 116900000,
    rank: 'silver',
    isSuperuser: true,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user_info');
    if (!storedUser) return;

    try {
      const parsedUser = JSON.parse(storedUser) as Partial<UserProfile> & { full_name?: string };
      setUser((currentUser) => ({
        ...currentUser,
        ...parsedUser,
        name: parsedUser.name || parsedUser.full_name || currentUser.name,
        email: parsedUser.email || currentUser.email,
      }));
    } catch {
      localStorage.removeItem('user_info');
    }
  }, []);

  // Tải danh sách địa chỉ với fallback cache cho local dev
  useEffect(() => {
    if (!user.id && !user.email) return;

    // Load nhanh từ cache local nếu có
    const cached = localStorage.getItem('cached_addresses');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAddresses(parsed);
        }
      } catch {
        // Bỏ qua lỗi parse
      }
    }

    fetch('/api/addresses', {
      headers: {
        'x-user-email': user.email,
        'x-user-id': String(user.id ?? ''),
      },
    })
      .then((response) => response.ok ? response.json() as Promise<{ addresses?: Address[] }> : Promise.reject())
      .then((data) => {
        if (data.addresses && Array.isArray(data.addresses)) {
          setAddresses(data.addresses);
          localStorage.setItem('cached_addresses', JSON.stringify(data.addresses));
        }
      })
      .catch(() => {
        // Giữ nguyên cached addresses nếu API gặp sự cố
      });
  }, [user.id, user.email]);

  useEffect(() => {
    if (!user.email) return;
    fetch('/api/auth/password', {
      headers: { 'x-user-email': user.email, 'x-user-id': String(user.id ?? '') },
    })
      .then((response) => response.ok ? response.json() as Promise<{ history?: PasswordHistory[] }> : Promise.reject())
      .then((data) => setPasswordHistory(data.history ?? []))
      .catch(() => {});
  }, [user.email, user.id]);

  // 1. Tải danh mục Tỉnh/Thành
  useEffect(() => {
    fetch('/api/administrative/provinces')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.provinces) && data.provinces.length > 0) {
          setProvinces(data.provinces.map((province: { id?: string | number; code?: string | number; name: string }) => ({
            id: String(province.id ?? province.code),
            name: province.name,
          })));
        }
      })
      .catch(() => {
        // Tự động dùng danh sách mặc định
      });
  }, []);

  // 2. Tải danh sách Xã/Phường theo Tỉnh được chọn
  useEffect(() => {
    if (!selectedProvinceId) {
      setCommunes([]);
      return;
    }

    let isActive = true;
    setIsLoadingCommunes(true);

    fetch(`/api/administrative/provinces/${encodeURIComponent(selectedProvinceId)}/communes`)
      .then((res) => {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then((data) => {
        if (!isActive) return;
        const rawList = data?.communes || data?.data || (Array.isArray(data) ? data : []);
        const list = Array.isArray(rawList)
          ? rawList.map((commune: { id?: string | number; code?: string | number; name: string }) => ({
            id: String(commune.id ?? commune.code),
            name: commune.name,
          }))
          : [];
        if (list.length > 0) {
          setCommunes(list);
        } else {
          setCommunes([
            { id: '1', name: 'Phường Xuân Hòa' },
            { id: '2', name: 'Phường Dịch Vọng' },
            { id: '3', name: 'Phường Hàng Bạc' },
            { id: '4', name: 'Xã Tiên Kiên' },
            { id: '5', name: 'Thị trấn Hùng Sơn' },
          ]);
        }
      })
      .catch(() => {
        if (isActive) {
          setCommunes([
            { id: '1', name: 'Phường Xuân Hòa' },
            { id: '2', name: 'Phường Cống Vị' },
            { id: '3', name: 'Phường Dịch Vọng' },
            { id: '4', name: 'Phường Kim Mã' },
            { id: '5', name: 'Phường Tràng Tiền' },
            { id: '6', name: 'Xã Hy Cương' },
            { id: '7', name: 'Xã Chu Hóa' },
          ]);
        }
      })
      .finally(() => {
        if (isActive) setIsLoadingCommunes(false);
      });

    return () => {
      isActive = false;
    };
  }, [selectedProvinceId]);

  const executeLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
    localStorage.removeItem('cached_addresses');
    window.dispatchEvent(new Event('auth-state-changed'));
    toast.info('Đã đăng xuất tài khoản');
    router.replace('/');
  };

  const handleLogout = () => {
    setConfirmationAction({ type: 'logout' });
  };

  // Pattern chuẩn Async Action Loading với try/finally
  const handleAddressSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    
    const name = String(form.get('name') || '').trim();
    const phone = String(form.get('phone') || '').trim();
    const detail = String(form.get('detail') || '').trim();
    const isDefault = form.get('isDefault') === 'on';

    const provinceSelect = formElement.elements.namedItem('province') as HTMLSelectElement | null;
    const communeSelect = formElement.elements.namedItem('commune') as HTMLSelectElement | null;
    
    const provinceName = provinceSelect?.selectedOptions[0]?.textContent?.replace(/\s+/g, ' ').trim() || '';
    const communeName = communeSelect?.selectedOptions[0]?.textContent?.replace(/\s+/g, ' ').trim() || '';

    if (!selectedProvinceId || !provinceName || provinceName.startsWith('--')) {
      toast.warning('Vui lòng chọn Tỉnh/Thành phố');
      return;
    }

    if (!communeName || communeName.startsWith('--')) {
      toast.warning('Vui lòng chọn Phường/Xã');
      return;
    }

    if (!name || !phone || !detail) {
      toast.warning('Vui lòng nhập đầy đủ họ tên, số điện thoại và địa chỉ chi tiết');
      return;
    }

    const fullProvince = `${communeName}, ${provinceName}`;
    setIsSubmittingAddress(true);

    try {
      const response = await fetch('/api/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email,
          'x-user-id': String(user.id ?? ''),
        },
        body: JSON.stringify({
          user_email: user.email,
          user_id: user.id,
          name,
          phone,
          province: fullProvince,
          detail,
          isDefault,
        }),
      });

      const data = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        toast.error(data.message || 'Không thể lưu địa chỉ.');
        return;
      }

      const newAddress: Address = data.address || {
        id: Date.now(),
        name,
        phone,
        province: fullProvince,
        detail,
        isDefault: isDefault || addresses.length === 0,
      };

      setAddresses((currentAddresses) => {
        const nextList = newAddress.isDefault
          ? [newAddress, ...currentAddresses.map((addr) => ({ ...addr, isDefault: false }))]
          : [newAddress, ...currentAddresses];
        localStorage.setItem('cached_addresses', JSON.stringify(nextList));
        return nextList;
      });

      setAddressPage(1);
      formElement.reset();
      setSelectedProvinceId('');
      setCommunes([]);
      toast.success('Thêm địa chỉ mới thành công!');
    } catch (error) {
      // Fallback local state nếu network offline
      const fallbackAddress: Address = {
        id: Date.now(),
        name,
        phone,
        province: fullProvince,
        detail,
        isDefault: isDefault || addresses.length === 0,
      };
      setAddresses((currentAddresses) => {
        const nextList = fallbackAddress.isDefault
          ? [fallbackAddress, ...currentAddresses.map((addr) => ({ ...addr, isDefault: false }))]
          : [fallbackAddress, ...currentAddresses];
        localStorage.setItem('cached_addresses', JSON.stringify(nextList));
        return nextList;
      });
      setAddressPage(1);
      formElement.reset();
      setSelectedProvinceId('');
      setCommunes([]);
      toast.success('Thêm địa chỉ mới thành công!');
    } finally {
      setIsSubmittingAddress(false);
    }
  };

  const handleAddressDelete = (addressId: number) => {
    setConfirmationAction({ type: 'delete-address', addressId });
  };

  const handleConfirmation = async () => {
    if (!confirmationAction) return;

    if (confirmationAction.type === 'logout') {
      executeLogout();
      setConfirmationAction(null);
      return;
    }

    const addressId = confirmationAction.addressId;
    setIsDeletingAddress(true);

    try {
      const response = await fetch(`/api/addresses?id=${addressId}`, {
        method: 'DELETE',
        headers: {
          'x-user-email': user.email,
          'x-user-id': String(user.id ?? ''),
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        toast.error(data.message || 'Không thể xóa địa chỉ.');
        return;
      }

      setAddresses((currentAddresses) => {
        const nextList = currentAddresses.filter(({ id }) => id !== addressId);
        localStorage.setItem('cached_addresses', JSON.stringify(nextList));
        return nextList;
      });
      
      setAddressPage((page) => Math.min(page, Math.max(1, Math.ceil((addresses.length - 1) / 3))));
      toast.success('Đã xóa địa chỉ thành công');
    } catch {
      // Fallback local xóa
      setAddresses((currentAddresses) => {
        const nextList = currentAddresses.filter(({ id }) => id !== addressId);
        localStorage.setItem('cached_addresses', JSON.stringify(nextList));
        return nextList;
      });
      toast.success('Đã xóa địa chỉ');
    } finally {
      setIsDeletingAddress(false);
      setConfirmationAction(null);
    }
  };

  const setDefaultAddress = async (addressId: number) => {
    setSettingDefaultId(addressId);
    try {
      const response = await fetch(`/api/addresses?id=${addressId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email,
          'x-user-id': String(user.id ?? ''),
        },
        body: JSON.stringify({ user_email: user.email, user_id: user.id }),
      });

      if (!response.ok) {
        toast.error('Không thể đặt địa chỉ mặc định.');
        return;
      }

      setAddresses((currentAddresses) => {
        const updated = currentAddresses.map((address) => ({
          ...address,
          isDefault: address.id === addressId,
        }));
        const sorted = [...updated.filter((a) => a.isDefault), ...updated.filter((a) => !a.isDefault)];
        localStorage.setItem('cached_addresses', JSON.stringify(sorted));
        return sorted;
      });
      toast.success('Đã đặt làm địa chỉ mặc định');
    } catch {
      // Fallback local
      setAddresses((currentAddresses) => {
        const updated = currentAddresses.map((address) => ({
          ...address,
          isDefault: address.id === addressId,
        }));
        const sorted = [...updated.filter((a) => a.isDefault), ...updated.filter((a) => !a.isDefault)];
        localStorage.setItem('cached_addresses', JSON.stringify(sorted));
        return sorted;
      });
      toast.success('Đã đặt làm địa chỉ mặc định');
    } finally {
      setSettingDefaultId(null);
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const currentPassword = String(form.get('currentPassword') || '');
    const newPassword = String(form.get('newPassword') || '');
    const confirmPassword = String(form.get('confirmPassword') || '');

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.warning('Vui lòng nhập đầy đủ thông tin mật khẩu.');
      return;
    }
    if (newPassword.length < 6) {
      toast.warning('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch('/api/auth/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email,
          'x-user-id': String(user.id ?? ''),
        },
        body: JSON.stringify({
          user_email: user.email,
          user_id: user.id,
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      const data = await response.json().catch(() => ({})) as { message?: string; historyEntry?: PasswordHistory };
      if (!response.ok) {
        toast.error(data.message || 'Không thể đổi mật khẩu.');
        return;
      }
      formElement.reset();
      if (data.historyEntry) {
        setPasswordHistory((currentHistory) => [data.historyEntry!, ...currentHistory]);
        setPasswordPage(1);
      }
      toast.success('Đổi mật khẩu thành công.');
    } catch {
      toast.error('Không thể kết nối đến máy chủ.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num) + 'đ';
  };

  const totalAddressPages = Math.ceil(addresses.length / 3);
  const paginationStart = Math.min(Math.max(1, addressPage), Math.max(1, totalAddressPages - 2));
  const paginationItems = Array.from(
    { length: Math.min(3, totalAddressPages) },
    (_, index) => paginationStart + index,
  );
  const totalPasswordPages = Math.ceil(passwordHistory.length / 4);
  const passwordPaginationStart = Math.min(Math.max(1, passwordPage), Math.max(1, totalPasswordPages - 2));
  const passwordPaginationItems = Array.from(
    { length: Math.min(3, totalPasswordPages) },
    (_, index) => passwordPaginationStart + index,
  );
  return (
    <div className="space-y-4 font-['Signika',sans-serif]">
      {/* =========================================================================
          KHỐI 1: THẺ THÔNG TIN NGƯỜI DÙNG & THỐNG KÊ
          ========================================================================= */}
      <div className="w-full bg-white rounded-xl py-3 px-6 shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-[220px]">
          <div className="w-11 h-11 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-black uppercase text-slate-900 tracking-wide">
              {user.name}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
              {user.email}
            </div>
          </div>
        </div>

        <div className="hidden lg:block h-10 w-[1px] bg-slate-100" />

        <div className="flex items-center gap-2.5 min-w-[180px]">
          <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-black text-slate-900 leading-tight">
              {user.totalOrders}
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              Tổng số đơn hàng đã mua
            </div>
          </div>
        </div>

        <div className="hidden lg:block h-10 w-[1px] bg-slate-100" />

        <div className="flex items-center gap-2.5 min-w-[200px]">
          <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-black text-slate-900 leading-tight">
              {formatVND(user.totalSpent)}
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              Tổng số tiền đã tiêu dùng
            </div>
          </div>
        </div>

        <div className="hidden lg:block h-10 w-[1px] bg-slate-100" />

        <div className="flex items-center gap-2.5 min-w-[140px]">
          <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" />
            </svg>
          </div>
          <div className="text-sm font-semibold text-slate-700">
            Hạng: <span className="text-[#d70018] font-bold">Bạc</span>
          </div>
        </div>

        <div className="hidden lg:block h-10 w-[1px] bg-slate-100" />

        <button
          type="button"
          onClick={handleLogout}
          className="flex flex-col items-center justify-center w-20 h-12 rounded-lg border border-slate-200 text-slate-600 hover:text-[#d70018] hover:border-red-200 transition cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="text-[11px] font-medium mt-1">Đăng xuất</span>
        </button>
      </div>

      {/* =========================================================================
          KHỐI 2: THANH TAB ĐIỀU HƯỚNG
          ========================================================================= */}
      <div className="w-full bg-white rounded-xl shadow-sm border border-slate-100 px-4 py-1 overflow-x-auto scrollbar-none mt-5">
        <div className="flex items-center justify-between min-w-[860px]">
          {user.isSuperuser && (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 py-2 px-3 text-xs font-semibold text-slate-600 hover:text-[#d70018] transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>Dashboard</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('address')}
            className={`relative flex items-center gap-2 py-2 px-3.5 text-xs font-semibold transition cursor-pointer ${activeTab === 'address' ? 'text-[#d70018]' : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Sổ địa chỉ</span>
            {activeTab === 'address' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#d70018] rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('password')}
            className={`relative flex items-center gap-2 py-2 px-3.5 text-xs font-semibold transition cursor-pointer ${activeTab === 'password' ? 'text-[#d70018]' : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Đổi mật khẩu</span>
            {activeTab === 'password' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#d70018] rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('student')}
            className={`relative flex items-center gap-2 py-2 px-3.5 text-xs font-semibold transition cursor-pointer ${activeTab === 'student' ? 'text-[#d70018]' : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Student - Teacher</span>
            {activeTab === 'student' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#d70018] rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('coupon')}
            className={`relative flex items-center gap-2 py-2 px-3.5 text-xs font-semibold transition cursor-pointer ${activeTab === 'coupon' ? 'text-[#d70018]' : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            <span>Mã giảm giá</span>
            {activeTab === 'coupon' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#d70018] rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`relative flex items-center gap-2 py-2 px-3.5 text-xs font-semibold transition cursor-pointer ${activeTab === 'history' ? 'text-[#d70018]' : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Lịch sử mua hàng</span>
            {activeTab === 'history' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#d70018] rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('refund')}
            className={`relative flex items-center gap-2 py-2 px-3.5 text-xs font-semibold transition cursor-pointer ${activeTab === 'refund' ? 'text-[#d70018]' : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Hoàn tiền</span>
            {activeTab === 'refund' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#d70018] rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* =========================================================================
          KHỐI 3: HỘP CHỨA ĐỊA CHỈ (Chuẩn hành chính mới 2 cấp)
          ========================================================================= */}
      <div className="mt-5">
        {activeTab === 'address' && (
          <div style={{ animation: 'fadeInTab 0.28s ease' }} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 min-h-[460px]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch h-full">

              {/* CỘT TRÁI: FORM THÊM ĐỊA CHỈ MỚI */}
              <div className="lg:col-span-6 flex flex-col justify-between h-full">
                <div className="flex items-center gap-2 text-sm font-bold text-[#d70018] mb-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                  <span className="text-slate-900 font-bold uppercase tracking-wide">Thêm địa chỉ mới</span>
                </div>

                <form className="flex-1 flex flex-col justify-between space-y-3 pt-2" onSubmit={handleAddressSubmit}>
                  {/* Họ tên & SĐT */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Họ tên
                      </label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Nhập họ tên"
                        onFocus={(e) => { e.currentTarget.style.animation = 'inputFocusGlow 0.3s ease forwards'; }}
                        onBlur={(e) => { e.currentTarget.style.animation = ''; }}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#d70018] bg-slate-50/50 transition focus:scale-[1.01]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Nhập số điện thoại"
                        onFocus={(e) => { e.currentTarget.style.animation = 'inputFocusGlow 0.3s ease forwards'; }}
                        onBlur={(e) => { e.currentTarget.style.animation = ''; }}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#d70018] bg-slate-50/50 transition focus:scale-[1.01]"
                        required
                      />
                    </div>
                  </div>

                  {/* Tỉnh/Thành phố & Phường/Xã (Mô hình 2 cấp mới) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tỉnh/Thành phố
                      </label>
                      <select
                        name="province"
                        value={selectedProvinceId}
                        onChange={(e) => setSelectedProvinceId(e.target.value)}
                        onFocus={(e) => { e.currentTarget.style.animation = 'inputFocusGlow 0.3s ease forwards'; }}
                        onBlur={(e) => { e.currentTarget.style.animation = ''; }}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#d70018] bg-slate-50/50 text-slate-700 cursor-pointer transition"
                        required
                      >
                        <option value="">-- Chọn Tỉnh/Thành phố --</option>
                        {provinces.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Phường/Xã
                      </label>
                      <select
                        name="commune"
                        onFocus={(e) => { e.currentTarget.style.animation = 'inputFocusGlow 0.3s ease forwards'; }}
                        onBlur={(e) => { e.currentTarget.style.animation = ''; }}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-700 cursor-pointer disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 transition"
                        disabled={isLoadingCommunes || communes.length === 0}
                        required
                      >
                        <option value="">
                          {isLoadingCommunes
                            ? 'Đang tải Phường/Xã...'
                            : '-- Chọn Phường/Xã --'}
                        </option>
                        {communes.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Địa chỉ chi tiết (Thôn / Tổ dân phố / Số nhà) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Địa chỉ chi tiết (Thôn, Tổ Dân Phố, Số nhà...)
                    </label>
                    <input
                      type="text"
                      name="detail"
                      placeholder="Ví dụ: TDP Abcxyz, Số x Đường..."
                      onFocus={(e) => { e.currentTarget.style.animation = 'inputFocusGlow 0.3s ease forwards'; }}
                      onBlur={(e) => { e.currentTarget.style.animation = ''; }}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#d70018] bg-slate-50/50 transition focus:scale-[1.01]"
                      required
                    />
                  </div>

                  {/* Checkbox */}
                  <div className="flex items-center gap-2 pt-0.5">
                    <input
                      type="checkbox"
                      id="addrDefault"
                      name="isDefault"
                      className="w-4 h-4 rounded border-slate-300 text-[#d70018] accent-[#d70018] cursor-pointer"
                    />
                    <label htmlFor="addrDefault" className="text-xs text-slate-600 select-none cursor-pointer">
                      Đặt làm địa chỉ mặc định
                    </label>
                  </div>

                  {/* Nút Submit Lift Pattern */}
                  <button
                    type="submit"
                    disabled={isSubmittingAddress}
                    className="w-full py-2.5 rounded-lg bg-[#d70018] text-white font-bold text-xs hover:bg-[#bf0015] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-sm mt-1"
                  >
                    {isSubmittingAddress ? (
                      <span className="inline-flex items-center gap-2">
                        <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Đang lưu địa chỉ...
                      </span>
                    ) : (
                      <>
                        <span className="text-base leading-none">+</span>
                        <span>Thêm địa chỉ</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* CỘT PHẢI: DANH SÁCH ĐỊA CHỈ */}
              <div className="lg:col-span-6 flex flex-col justify-between h-full">
                <div className="flex items-center gap-2 text-sm font-bold text-[#d70018] mb-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-slate-900 font-bold uppercase tracking-wide">Danh sách địa chỉ của bạn</span>
                </div>

                <div className="flex-1 w-full min-h-[390px] p-0 flex flex-col justify-center items-center overflow-hidden mt-2">
                  {addresses.length === 0 ? (
                    <div className="w-full flex flex-col items-center justify-center text-center p-4">
                      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 mb-2.5">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xs font-bold text-slate-800">
                        Bạn chưa thêm địa chỉ nào.
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Hãy thêm địa chỉ giao hàng ở bên trái nhé!
                      </p>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col justify-between gap-3">
                      <div className="space-y-2 overflow-y-auto">
                        {addresses.slice((addressPage - 1) * 3, addressPage * 3).map((address) => (
                          <div
                            key={address.id}
                            style={{ animation: 'slideInAddress 0.3s ease' }}
                            className={`rounded-lg border bg-white p-3 text-xs text-slate-700 shadow-sm hover:shadow-md hover:-translate-y-[2px] transition-all duration-200 ${
                              address.isDefault ? 'border-[#d70018] ring-1 ring-[#d70018]/20' : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-bold text-slate-900">{address.name} - {address.phone}</p>
                                <p className="mt-1 text-slate-500">{address.detail}, {address.province}</p>
                                <div className="mt-2 flex items-center gap-2">
                                  {address.isDefault ? (
                                    <span className="rounded-full bg-[#d70018] px-2 py-1 text-[10px] font-bold text-white">
                                      Đang mặc định
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      disabled={settingDefaultId !== null}
                                      onClick={() => setDefaultAddress(address.id)}
                                      className="rounded-md border border-[#d70018] px-2 py-1 text-[10px] font-semibold text-[#d70018] hover:bg-red-50 transition cursor-pointer disabled:opacity-50"
                                    >
                                      {settingDefaultId === address.id ? (
                                        <span className="inline-flex items-center gap-1">
                                          <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                          </svg>
                                          Đang đặt...
                                        </span>
                                      ) : (
                                        'Đặt mặc định'
                                      )}
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleAddressDelete(address.id)}
                                    className="rounded-md border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors duration-150 cursor-pointer"
                                  >
                                    Xóa
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-center gap-2 pt-1">
                        <button
                          type="button"
                          disabled={addressPage === 1}
                          onClick={() => setAddressPage((page) => page - 1)}
                          className="h-9 w-9 rounded-full border border-slate-200 text-slate-500 hover:scale-110 active:scale-90 transition-all duration-150 disabled:opacity-40 disabled:hover:scale-100 cursor-pointer"
                        >
                          ‹
                        </button>
                        {paginationItems.map((page) => (
                          <button
                            key={page}
                            type="button"
                            onClick={() => setAddressPage(page)}
                            className={`h-9 w-9 rounded-full text-xs font-bold hover:scale-110 active:scale-90 transition-all duration-150 cursor-pointer ${
                              addressPage === page ? 'bg-[#d70018] text-white shadow-md' : 'border border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          type="button"
                          disabled={addressPage === totalAddressPages}
                          onClick={() => setAddressPage((page) => page + 1)}
                          className="h-9 w-9 rounded-full border border-slate-200 text-slate-500 hover:scale-110 active:scale-90 transition-all duration-150 disabled:opacity-40 disabled:hover:scale-100 cursor-pointer"
                        >
                          ›
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {activeTab === 'password' && (
          <div style={{ animation: 'fadeInTab 0.28s ease' }} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 min-h-[460px]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch h-full">
              <div className="lg:col-span-6 flex flex-col justify-between h-full">
                <div className="flex items-center gap-2 text-sm font-bold text-[#d70018] mb-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-slate-900 font-bold uppercase tracking-wide">Đổi mật khẩu</span>
                </div>

                <form className="flex-1 flex flex-col justify-between space-y-3 pt-2" onSubmit={handlePasswordSubmit}>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mật khẩu hiện tại</label>
                    <input
                      type="password"
                      name="currentPassword"
                      placeholder="Nhập mật khẩu hiện tại"
                      onFocus={(e) => { e.currentTarget.style.animation = 'inputFocusGlow 0.3s ease forwards'; }}
                      onBlur={(e) => { e.currentTarget.style.animation = ''; }}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#d70018] bg-slate-50/50 transition focus:scale-[1.01]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mật khẩu mới</label>
                    <input
                      type="password"
                      name="newPassword"
                      placeholder="Nhập mật khẩu mới"
                      onFocus={(e) => { e.currentTarget.style.animation = 'inputFocusGlow 0.3s ease forwards'; }}
                      onBlur={(e) => { e.currentTarget.style.animation = ''; }}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#d70018] bg-slate-50/50 transition focus:scale-[1.01]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Xác nhận mật khẩu mới</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Nhập lại mật khẩu mới"
                      onFocus={(e) => { e.currentTarget.style.animation = 'inputFocusGlow 0.3s ease forwards'; }}
                      onBlur={(e) => { e.currentTarget.style.animation = ''; }}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#d70018] bg-slate-50/50 transition focus:scale-[1.01]"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="w-full py-2.5 rounded-lg bg-[#d70018] text-white font-bold text-xs hover:bg-[#bf0015] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 cursor-pointer shadow-sm mt-1 flex items-center justify-center gap-2"
                  >
                    {isChangingPassword ? (
                      <span className="inline-flex items-center gap-2">
                        <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Đang cập nhật...
                      </span>
                    ) : (
                      'Cập nhật mật khẩu'
                    )}
                  </button>
                </form>
              </div>

              <div className="lg:col-span-6 flex flex-col justify-between h-full">
                <div className="flex items-center gap-2 text-sm font-bold text-[#d70018] mb-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-slate-900 font-bold uppercase tracking-wide">Lịch sử đổi mật khẩu</span>
                </div>
                <div className="flex-1 w-full min-h-[390px] p-0 flex flex-col justify-center items-center overflow-hidden mt-2">
                  {passwordHistory.length === 0 ? (
                    <div className="w-full flex flex-col items-center justify-center text-center p-4">
                      <svg className="w-14 h-14 text-slate-300 mb-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="text-xs font-bold text-slate-800">Bạn chưa đổi mật khẩu lần nào.</h3>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Hãy thử đổi mật khẩu ở bên trái nhé!
                      </p>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col justify-between gap-3">
                      <div className="space-y-2 overflow-y-auto">
                        {passwordHistory.slice((passwordPage - 1) * 4, passwordPage * 4).map((entry) => (
                          <div
                            key={entry.id}
                            style={{ animation: 'fadeInCard 0.35s ease' }}
                            className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-700 shadow-sm hover:shadow-md hover:-translate-y-[2px] transition-all duration-200"
                          >
                            <p className="font-bold text-slate-900">Đổi mật khẩu thành công</p>
                            <p className="mt-1 text-slate-500">
                              {new Date(entry.changedAt).toLocaleString('vi-VN')} · IP: {entry.ipAddress}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-center gap-2 pt-1">
                        <button
                          type="button"
                          disabled={passwordPage === 1}
                          onClick={() => setPasswordPage((page) => page - 1)}
                          className="h-9 w-9 rounded-full border border-slate-200 text-slate-500 hover:scale-110 active:scale-90 transition-all duration-150 disabled:opacity-40 disabled:hover:scale-100 cursor-pointer"
                        >
                          ‹
                        </button>
                        {passwordPaginationItems.map((page) => (
                          <button
                            key={page}
                            type="button"
                            onClick={() => setPasswordPage(page)}
                            className={`h-9 w-9 rounded-full text-xs font-bold hover:scale-110 active:scale-90 transition-all duration-150 cursor-pointer ${
                              passwordPage === page ? 'bg-[#d70018] text-white shadow-md' : 'border border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          type="button"
                          disabled={passwordPage === totalPasswordPages}
                          onClick={() => setPasswordPage((page) => page + 1)}
                          className="h-9 w-9 rounded-full border border-slate-200 text-slate-500 hover:scale-110 active:scale-90 transition-all duration-150 disabled:opacity-40 disabled:hover:scale-100 cursor-pointer"
                        >
                          ›
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmationAction && (
        <div
          style={{ animation: 'modalBackdropIn 0.2s ease' }}
          onClick={() => setConfirmationAction(null)}
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            style={{ animation: 'modalContentIn 0.25s ease' }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-[calc(100%-2rem)] max-w-[420px] p-5 sm:p-6 shadow-xl border border-slate-100 text-center cursor-default"
          >
            {/* Icon theo action type */}
            {confirmationAction.type === 'delete-address' ? (
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-[#d70018]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
            ) : (
              <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
            )}

            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
              {confirmationAction.type === 'logout' ? 'Bạn có chắc chắn muốn đăng xuất?' : 'Bạn có chắc chắn muốn xóa địa chỉ này?'}
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              {confirmationAction.type === 'logout'
                ? 'Phiên làm việc hiện tại sẽ kết thúc.'
                : 'Địa chỉ này sẽ được xóa khỏi danh sách của bạn.'}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setConfirmationAction(null)}
                className="flex-1 min-h-11 py-2.5 px-4 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isDeletingAddress}
                onClick={handleConfirmation}
                className="flex-1 min-h-11 py-2.5 px-4 rounded-lg bg-[#d70018] text-white text-sm font-semibold hover:bg-[#bf0015] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                {isDeletingAddress ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Đang xử lý...
                  </span>
                ) : (
                  confirmationAction.type === 'logout' ? 'Đăng xuất' : 'Xóa'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}