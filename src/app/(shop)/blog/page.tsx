import Link from "next/link";

const posts = [{ slug: "chon-smartphone-phu-hop", title: "Cach chon smartphone phu hop voi ban", category: "Huong dan" }, { slug: "bao-quan-pin-dien-thoai", title: "5 thoi quen giup pin ben hon", category: "Meo hay" }];

export default function BlogPage() { return <main className="store-shell"><section className="home-section"><p className="eyebrow">Journal / Mobile Store</p><div className="section-heading"><h1>Blog</h1><span>Kien thuc va cam hung</span></div><div className="product-grid">{posts.map((post) => <article className="category-tile category-1" key={post.slug}><p className="eyebrow">{post.category}</p><h2>{post.title}</h2><Link href={`/blog/${post.slug}`}>Doc bai viet -&gt;</Link></article>)}</div></section></main>; }
