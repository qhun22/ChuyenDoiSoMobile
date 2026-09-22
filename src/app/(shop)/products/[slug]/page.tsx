import Link from "next/link";
import VariantSelector from "@/components/product/VariantSelector";
import { formatVND } from "@/lib/formatters";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <main className="store-shell"><section className="home-section product-detail"><p className="eyebrow">San pham / {slug}</p><div className="product-detail-grid"><div className="product-image product-image-large">Nova X Pro</div><div><h1>{slug.replaceAll("-", " ")}</h1><p className="detail-price">{formatVND(18990000)}</p><p>Thiet bi chinh hang, bao hanh 12 thang va giao hang toan quoc.</p><VariantSelector variants={[{ id: 1, ram: "12GB", storage: "256GB", color: "Den", price: 18990000, stock: 8 }]} /><button className="primary-button" type="button">Them vao gio</button><p><Link href="/products">&lt;- Quay lai san pham</Link></p></div></div></section></main>;
}
