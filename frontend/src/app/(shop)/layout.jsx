import Header from '../../components/shop/Header';
import Footer from '../../components/shop/Footer';
import ShopOAuthProvider from '../../components/shop/ShopOAuthProvider';

export default function ShopLayout({ children }) {
  return (
    <ShopOAuthProvider>
      <Header />
      <main>{children}</main>
      <Footer />
    </ShopOAuthProvider>
  );
}
