export type Address = { id: number; label: string; recipient: string; phone: string; detail: string; is_default: boolean };
export type User = { id: number; email: string; full_name: string; phone?: string; addresses?: Address[] };
