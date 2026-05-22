'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import api from '../../../../lib/api';
import useStore from '../../../../store/useStore';

function formatVnd(value) {
  return Number(value || 0).toLocaleString('vi-VN');
}

function asText(value, fallback = 'Đang cập nhật') {
  if (!value) {
    return fallback;
  }

  return String(value);
}

export default function ProductDetailPage({ params }) {
  const { id } = React.use(params);
  const router = useRouter();
  const incrementCartCount = useStore((state) => state.incrementCartCount);

  const [productDetail, setProductDetail] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [quantity, setQuantity] = React.useState(1);
  const [isAdding, setIsAdding] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');

  React.useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const response = await api.get(`/products/${id}`);

        if (!isMounted) {
          return;
        }

        setProductDetail(response.data?.data || null);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage('Không thể tải thông tin sản phẩm.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  React.useEffect(() => {
    if (!toastMessage) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setToastMessage('');
    }, 2200);

    return () => {
      window.clearTimeout(timer);
    };
  }, [toastMessage]);

  const product = productDetail?.product;

  async function handleAddToCart() {
    if (!product || isAdding) {
      return;
    }

    try {
      setIsAdding(true);
      await api.post('/cart', {
        product_id: product.id,
        quantity,
      });

      incrementCartCount(quantity);
      setToastMessage('Đã thêm vào giỏ hàng');
    } catch (error) {
      if (error?.response?.status === 401) {
        router.push('/login');
        return;
      }

      setToastMessage('Thêm vào giỏ thất bại');
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <>
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {isLoading ? (
          <div className="py-16 text-sm text-neutral-500">Đang tải thông tin sản phẩm...</div>
        ) : errorMessage ? (
          <div className="rounded-[24px] border border-dashed border-neutral-200 bg-white p-8 text-sm text-neutral-500">
            {errorMessage}
          </div>
        ) : !product ? (
          <div className="rounded-[24px] border border-dashed border-neutral-200 bg-white p-8 text-sm text-neutral-500">
            Sản phẩm không tồn tại.
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="overflow-hidden rounded-[28px] bg-[#f5f5f5]">
              <div className="aspect-[4/5] w-full overflow-hidden">
                <img
                  src={product.main_image_url}
                  alt={product.name_vi}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="space-y-8">
              <nav className="flex items-center gap-2 text-xs tracking-[0.18em] text-neutral-400 uppercase">
                <Link href="/" className="transition hover:text-neutral-700">Trang chủ</Link>
                <ChevronRight className="h-3.5 w-3.5" />
                <Link href="/products" className="transition hover:text-neutral-700">Sản phẩm</Link>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="truncate text-neutral-500">{product.name_vi}</span>
              </nav>

              <div className="space-y-4">
                <h1 className="text-4xl font-light tracking-[-0.05em] text-neutral-950 sm:text-5xl">
                  {product.name_vi}
                </h1>
                <p className="text-2xl font-semibold text-neutral-900">{formatVnd(product.price_vnd)} VND</p>
              </div>

              <div className="space-y-6 text-neutral-600">
                <div>
                  <p className="text-xs uppercase tracking-[0.26em] text-neutral-400">Tóm tắt</p>
                  <p className="mt-2 text-[15px] leading-8">{asText(product.summary_vi, asText(product.tagline_vi))}</p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.26em] text-neutral-400">Thành phần</p>
                  <p className="mt-2 text-[15px] leading-8">{asText(product.ingredients_vi)}</p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.26em] text-neutral-400">Hạn sử dụng</p>
                  <p className="mt-2 text-[15px] leading-8">{asText(product.shelf_life_vi)}</p>
                </div>
              </div>

              <div className="space-y-5 border-t border-neutral-200 pt-7">
                <div className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-1 py-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full text-lg text-neutral-700 transition hover:bg-neutral-100"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="inline-flex min-w-12 items-center justify-center text-sm font-medium text-neutral-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => prev + 1)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full text-lg text-neutral-700 transition hover:bg-neutral-100"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isAdding}
                    className="inline-flex h-12 items-center justify-center rounded-full border border-neutral-300 bg-white px-5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isAdding ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-12 items-center justify-center rounded-full bg-neutral-950 px-5 text-sm font-medium text-white transition hover:bg-neutral-800"
                  >
                    Mua ngay
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      <div className={`fixed bottom-5 right-5 z-[80] transition ${toastMessage ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0 pointer-events-none'}`}>
        <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800 shadow-[0_18px_45px_rgba(15,23,42,0.14)]">
          {toastMessage}
        </div>
      </div>
    </>
  );
}
