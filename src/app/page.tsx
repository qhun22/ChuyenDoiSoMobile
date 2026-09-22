import Link from "next/link";

export default function Home() {
  return (
    <main className="store-shell">
      <section className="hero-section">
        <div>
          <p className="eyebrow">Mobile Store / 2026</p>
          <h1>Cong nghe trong tam tay.</h1>
          <p className="hero-copy">
            Dien thoai, tablet va phu kien chinh hang, san sang cho nhip song
            cua ban.
          </p>
          <Link className="primary-button" href="/products">
            Kham pha san pham
          </Link>
        </div>
        <div className="hero-device" aria-hidden="true">
          <span>01</span>
          <strong>NEW<br />DROP</strong>
        </div>
      </section>

      <section className="home-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Danh muc</p>
            <h2>Chon theo nhu cau</h2>
          </div>
          <Link href="/products">Xem tat ca -&gt;</Link>
        </div>
        <div className="category-grid">
          {["Smartphone", "Tablet", "Phu kien"].map((category, index) => (
            <Link className={`category-tile category-${index + 1}`} href={`/products?category=${category.toLowerCase()}`} key={category}>
              <span>0{index + 1}</span>
              <strong>{category}</strong>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
