import Header from '../../components/shop/Header';
import Footer from '../../components/shop/Footer';

export default function ShopLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#fbfaf7] text-neutral-900">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
