'use client';

export default function FloatingContact() {
	return (
		<div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
			<a
				href="https://zalo.me/0327221005"
				target="_blank"
				rel="noreferrer"
				className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:scale-110"
				title="Chat Zalo"
			>
				<i className="ri-chat-3-fill text-xl"></i>
			</a>
			<a
				href="tel:0327221005"
				className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition hover:scale-110"
				title="Gọi điện"
			>
				<i className="ri-phone-fill text-xl"></i>
			</a>
		</div>
	);
}
