export type Brand = { id: number; name: string; slug: string };
export type Category = { id: number; name: string; slug: string };
export type Variant = { id: number; ram: string; storage: string; color: string; price: number; stock: number };
export type Product = { id: number; name: string; slug: string; description?: string; price: number; image?: string; brand?: Brand; category?: Category; variants?: Variant[] };
