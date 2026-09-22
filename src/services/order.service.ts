import { apiFetch } from "./api";
import type { Order, PaymentMethod } from "@/types/order";
export function createOrder(payload: { address_id: number; payment_method: PaymentMethod }) { return apiFetch<Order>("/orders/", { method: "POST", body: JSON.stringify(payload) }); }
export function createPaymentUrl(orderId: number, paymentMethod: PaymentMethod) { return apiFetch<{ payment_url: string }>(`/orders/${orderId}/payment/`, { method: "POST", body: JSON.stringify({ payment_method: paymentMethod }) }); }
