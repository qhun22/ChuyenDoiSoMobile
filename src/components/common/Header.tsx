import Link from "next/link";

export default function Header() {
  return (
    <header className="site-header">
      <Link className="brand" href="/">Mobile Store</Link>
      <nav className="header-nav" aria-label="Dieu huong chinh">
        <Link href="/products">San pham</Link>
        <Link href="/products?category=phu-kien">Phu kien</Link>
        <Link href="/profile">Tai khoan</Link>
      </nav>
      <div className="header-actions"><Link href="/cart">Gio hang (0)</Link><Link href="/login">Dang nhap</Link></div>
    </header>
  );
}
