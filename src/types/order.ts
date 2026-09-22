export type PaymentMethod = "vnpay" | "momo" | "vietqr" | "cod";
export type Order = { id: number; code: string; status: string; total: number; payment_method: PaymentMethod };
