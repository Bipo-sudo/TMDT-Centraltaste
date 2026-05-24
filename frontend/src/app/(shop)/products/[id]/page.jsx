'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronRight,
  Heart,
  Minus,
  Plus,
  Package,
  Share2,
  ShoppingCart,
} from 'lucide-react';
import api from '../../../../lib/api';
import useStore from '../../../../store/useStore';

function formatVnd(value) {
  return Number(value || 0).toLocaleString('vi-VN');
}

function textOrFallback(value, fallback = 'Đang cập nhật') {
  if (!value) {
    return fallback;
  }

  return String(value).trim() || fallback;
}

function splitIngredients(value) {
  if (!value) {
    return [];
  }

  return String(value)
    .split(/\n|;|•|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function resolveImageUrl(imageUrl, fallbackUrl) {
  if (!imageUrl) {
    return fallbackUrl || '';
  }

  const normalized = String(imageUrl);
  if (normalized.includes('example.com')) {
    return fallbackUrl || '';
  }

  return normalized;
}

function buildGalleryImages(product, productionSteps) {
  const remoteImages = [
    product?.main_image_url,
    ...(productionSteps || []).map((step) => step.step_image_url),
  ]
    .filter(Boolean)
    .map((imageUrl) => String(imageUrl))
    .filter((imageUrl) => !imageUrl.includes('example.com'));

  return Array.from(new Set(remoteImages)).slice(0, 4);
}

function DetailTabButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative pb-4 text-sm font-medium tracking-[0.12em] uppercase transition sm:text-[14px] ${
        active ? 'text-[#e0b43e]' : 'text-[rgba(240,235,224,0.58)] hover:text-[rgba(240,235,224,0.82)]'
      }`}
    >
      {children}
      <span
        className={`absolute bottom-0 left-0 h-[2px] w-full transition ${active ? 'bg-[#e0b43e]' : 'bg-transparent'}`}
      />
    </button>
  );
}

function RelatedProductCard({ product }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group overflow-hidden rounded-[18px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] transition duration-300 hover:-translate-y-1 hover:border-[rgba(224,180,62,0.35)]"
    >
      <div className="relative aspect-square overflow-hidden bg-[#14110d]">
        {resolveImageUrl(product.main_image_url) ? (
          <img
            src={resolveImageUrl(product.main_image_url)}
            alt={product.name_vi}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[rgba(224,180,62,0.35)]">
            <Package className="h-8 w-8" />
          </div>
        )}
        <div className="absolute left-3 top-3 rounded-full border border-[rgba(224,180,62,0.2)] bg-[rgba(10,9,8,0.72)] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[#e0b43e] backdrop-blur-sm">
          {product.category_name_vi || product.category_slug}
        </div>
      </div>

      <div className="space-y-3 p-4">
        <h3 className="line-clamp-2 min-h-[2.8rem] text-[17px] leading-[1.3] text-[#f0ebe0]" style={{ fontFamily: 'var(--font-display)' }}>
          {product.name_vi}
        </h3>
        <div className="flex items-center justify-between gap-3">
          <p className="text-[17px] font-semibold text-[#e0b43e]">
            {formatVnd(product.price_vnd)}<span className="text-[13px] font-normal">đ</span>
          </p>
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(255,255,255,0.12)] text-[#f0ebe0] transition group-hover:border-[rgba(224,180,62,0.35)] group-hover:text-[#e0b43e]">
            <ShoppingCart className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const incrementCartCount = useStore((state) => state.incrementCartCount);

  const [productDetail, setProductDetail] = React.useState(null);
  const [relatedProducts, setRelatedProducts] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [quantity, setQuantity] = React.useState(1);
  const [isAdding, setIsAdding] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);
  const [activeTab, setActiveTab] = React.useState('description');

  React.useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const [detailResponse, listResponse] = await Promise.all([api.get(`/products/${id}`), api.get('/products')]);

        if (!isMounted) {
          return;
        }

        const detail = detailResponse.data?.data || null;
        const product = detail?.product || null;
        const allProducts = listResponse.data?.data || [];

        setProductDetail(detail);
        setRelatedProducts(
          allProducts
            .filter((item) => item.id !== product?.id && item.category_slug === product?.category_slug)
            .slice(0, 4)
        );
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

    if (id) {
      loadProduct();
    }

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
  const story = productDetail?.story || null;
  const productionSteps = productDetail?.productionSteps || [];
  const ingredients = React.useMemo(() => splitIngredients(product?.ingredients_vi), [product?.ingredients_vi]);
  const galleryImages = React.useMemo(() => buildGalleryImages(product, productionSteps), [product, productionSteps]);
  const storageSummary = textOrFallback(product?.preservation_vi);
  const shelfLife = textOrFallback(product?.shelf_life_vi);

  React.useEffect(() => {
    setSelectedImageIndex(0);
  }, [product?.id]);

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
      <div className="bg-[#0c0b09] text-[#f0ebe0]">
        <section className="mx-auto w-full max-w-[1536px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          {isLoading ? (
            <div className="space-y-6 py-8">
              <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="rounded-[28px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-4">
                  <div className="aspect-square animate-pulse rounded-[20px] bg-[rgba(224,180,62,0.06)]" />
                </div>
                <div className="space-y-4 rounded-[28px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-6">
                  <div className="h-4 w-44 animate-pulse rounded-full bg-[rgba(224,180,62,0.08)]" />
                  <div className="h-12 w-4/5 animate-pulse rounded bg-[rgba(224,180,62,0.08)]" />
                  <div className="h-8 w-32 animate-pulse rounded bg-[rgba(224,180,62,0.08)]" />
                  <div className="h-32 w-full animate-pulse rounded-[20px] bg-[rgba(224,180,62,0.05)]" />
                </div>
              </div>
            </div>
          ) : errorMessage ? (
            <div className="rounded-[24px] border border-dashed border-[rgba(224,180,62,0.25)] bg-[rgba(255,255,255,0.02)] p-8 text-sm text-[rgba(240,235,224,0.68)]">
              {errorMessage}
            </div>
          ) : !product ? (
            <div className="rounded-[24px] border border-dashed border-[rgba(224,180,62,0.25)] bg-[rgba(255,255,255,0.02)] p-8 text-sm text-[rgba(240,235,224,0.68)]">
              Sản phẩm không tồn tại.
            </div>
          ) : (
            <div className="space-y-10">
              <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] xl:gap-12">
                <div className="rounded-[28px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-3 shadow-[0_24px_60px_rgba(0,0,0,0.18)]">
                  <div className="relative overflow-hidden rounded-[22px] bg-[#14110d]">
                    <div className="absolute left-4 top-4 z-10 rounded-full border border-[rgba(224,180,62,0.25)] bg-[rgba(10,9,8,0.72)] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#e0b43e] backdrop-blur-sm">
                      Bộ sưu tập
                    </div>
                    <div className="aspect-square overflow-hidden">
                      {galleryImages[selectedImageIndex] || product.main_image_url ? (
                        <img
                          src={galleryImages[selectedImageIndex] || product.main_image_url}
                          alt={product.name_vi}
                          className="h-full w-full object-cover"
                          onError={(event) => {
                            event.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[rgba(224,180,62,0.35)]">
                          <Package className="h-10 w-10" />
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-4 right-4 rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(10,9,8,0.76)] px-3 py-1 text-xs text-[rgba(240,235,224,0.76)] backdrop-blur-sm">
                      {selectedImageIndex + 1} / {galleryImages.length}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-4 gap-3">
                    {galleryImages.map((image, index) => (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        onClick={() => setSelectedImageIndex(index)}
                        className={`aspect-square overflow-hidden rounded-[16px] border transition ${
                          selectedImageIndex === index
                            ? 'border-[#e0b43e] ring-2 ring-[rgba(224,180,62,0.2)]'
                            : 'border-[rgba(255,255,255,0.1)] hover:border-[rgba(224,180,62,0.3)]'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.name_vi} ${index + 1}`}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.parentElement?.classList.add('hidden');
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-[28px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-6 sm:p-8">
                  <nav className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[rgba(240,235,224,0.5)]">
                    <Link href="/" className="transition hover:text-[#e0b43e]">
                      Trang chủ
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5" />
                    <Link href="/products" className="transition hover:text-[#e0b43e]">
                      Sản phẩm
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5" />
                    <span className="truncate text-[rgba(240,235,224,0.78)]">{product.name_vi}</span>
                  </nav>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <span className="rounded-full border border-[rgba(224,180,62,0.22)] bg-[rgba(224,180,62,0.08)] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[#e0b43e]">
                      {product.category_name_vi || product.category_slug}
                    </span>
                    {product.weight_gram ? (
                      <span className="rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[rgba(240,235,224,0.72)]">
                        {product.weight_gram}
                        {product.unit ? ` ${product.unit}` : ''}
                      </span>
                    ) : null}
                    <span className="rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[rgba(240,235,224,0.72)]">
                      {product.stock > 0 ? 'Còn hàng' : 'Hết hàng'}
                    </span>
                  </div>

                  <div className="mt-6 space-y-3">
                    <h1 className="text-[2.25rem] leading-[1.06] tracking-[-0.04em] text-[#f0ebe0] sm:text-[3rem] lg:text-[3.3rem]" style={{ fontFamily: 'var(--font-display)', fontWeight: 300 }}>
                      {product.name_vi}
                    </h1>
                    <p className="max-w-[52ch] text-[15px] leading-7 text-[rgba(240,235,224,0.72)]">
                      {textOrFallback(product.tagline_vi, product.summary_vi)}
                    </p>
                  </div>

                  <div className="mt-6 flex items-baseline gap-3">
                    <p className="text-[2rem] font-semibold text-[#e0b43e] sm:text-[2.25rem]">
                      {formatVnd(product.price_vnd)}<span className="text-[1rem] font-normal">đ</span>
                    </p>
                  </div>

                  <div className="mt-6 rounded-[20px] border border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.18)] p-4 text-[14px] leading-7 text-[rgba(240,235,224,0.76)]">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-[rgba(224,180,62,0.7)]">Mô tả ngắn</p>
                    <p className="mt-2">{textOrFallback(product.summary_vi, story?.culture_vi)}</p>
                  </div>

                  <div className="mt-6 flex items-center gap-4">
                    <span className="text-[14px] text-[rgba(240,235,224,0.7)]">Số lượng:</span>
                    <div className="inline-flex items-center rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.02)] p-1">
                      <button
                        type="button"
                        onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-lg text-[#f0ebe0] transition hover:bg-[rgba(255,255,255,0.05)]"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="inline-flex min-w-12 items-center justify-center px-4 text-sm font-medium text-[#f0ebe0]">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity((prev) => prev + 1)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-lg text-[#f0ebe0] transition hover:bg-[rgba(255,255,255,0.05)]"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={isAdding}
                      className="inline-flex h-12 items-center justify-center rounded-full bg-[#e0b43e] px-6 text-sm font-semibold text-[#1a1208] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isAdding ? 'Đang thêm...' : 'THÊM VÀO GIỎ HÀNG'}
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-12 items-center justify-center rounded-full border border-[rgba(255,255,255,0.12)] bg-transparent px-5 text-sm font-medium text-[rgba(240,235,224,0.88)] transition hover:border-[rgba(224,180,62,0.35)] hover:text-[#e0b43e]"
                    >
                      <Heart className="mr-2 h-4 w-4" />
                      Yêu thích
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-12 items-center justify-center rounded-full border border-[rgba(255,255,255,0.12)] bg-transparent px-5 text-sm font-medium text-[rgba(240,235,224,0.88)] transition hover:border-[rgba(224,180,62,0.35)] hover:text-[#e0b43e]"
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Chia sẻ
                    </button>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[18px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-4">
                      <p className="text-sm font-semibold text-[#f0ebe0]">Nguồn gốc</p>
                      <p className="mt-1 text-sm leading-6 text-[rgba(240,235,224,0.72)]">
                        {textOrFallback(story?.origin_vi)}
                      </p>
                    </div>
                    <div className="rounded-[18px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-4">
                      <p className="text-sm font-semibold text-[#f0ebe0]">Tình trạng</p>
                      <p className="mt-1 text-sm leading-6 text-[rgba(240,235,224,0.72)]">
                        {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Tạm hết hàng'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-6 sm:p-8">
                <div className="flex items-center gap-8 overflow-x-auto border-b border-[rgba(255,255,255,0.08)] pb-1 scrollbar-hide">
                  <DetailTabButton active={activeTab === 'description'} onClick={() => setActiveTab('description')}>
                    MÔ TẢ CHI TIẾT
                  </DetailTabButton>
                  <DetailTabButton active={activeTab === 'ingredients'} onClick={() => setActiveTab('ingredients')}>
                    THÀNH PHẦN
                  </DetailTabButton>
                  <DetailTabButton active={activeTab === 'storage'} onClick={() => setActiveTab('storage')}>
                    BẢO QUẢN
                  </DetailTabButton>
                  <DetailTabButton active={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')}>
                    ĐÁNH GIÁ
                  </DetailTabButton>
                </div>

                <div className="pt-8">
                  {activeTab === 'description' ? (
                    <div className="space-y-5 text-[15px] leading-8 text-[rgba(240,235,224,0.8)]">
                      <p>{textOrFallback(product.summary_vi, story?.culture_vi)}</p>
                      <p>
                        {textOrFallback(
                          story?.culture_vi,
                          'Sản phẩm được chọn lọc từ nguồn nguyên liệu phù hợp và giữ trọn giá trị truyền thống.'
                        )}
                      </p>
                      <p>
                        <strong className="text-[#f0ebe0]">Nguồn gốc:</strong> {textOrFallback(story?.origin_vi)}
                      </p>
                    </div>
                  ) : null}

                  {activeTab === 'ingredients' ? (
                    <div className="space-y-5">
                      <h3 className="text-[1.1rem] font-semibold text-[#f0ebe0]">Thành phần chính:</h3>
                      {ingredients.length > 0 ? (
                        <ul className="space-y-3 text-[15px] leading-7 text-[rgba(240,235,224,0.8)]">
                          {ingredients.map((ingredient, index) => (
                            <li key={`${ingredient}-${index}`} className="flex items-start gap-3">
                              <span className="mt-2 h-2 w-2 rounded-full bg-[#e0b43e]" />
                              <span>{ingredient}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[15px] leading-7 text-[rgba(240,235,224,0.72)]">Đang cập nhật thành phần.</p>
                      )}

                      {product.allergens_vi ? (
                        <div className="rounded-[18px] border border-[rgba(224,180,62,0.2)] bg-[rgba(224,180,62,0.08)] p-4 text-[14px] leading-7 text-[#e0b43e]">
                          <strong className="text-[#f0ebe0]">Lưu ý:</strong> {product.allergens_vi}
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {activeTab === 'storage' ? (
                    <div className="space-y-5">
                      <p className="text-[15px] leading-8 text-[rgba(240,235,224,0.8)]">{storageSummary}</p>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-[18px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-4">
                          <h4 className="text-[1rem] font-semibold text-[#f0ebe0]">Bảo quản</h4>
                          <p className="mt-2 text-[14px] leading-7 text-[rgba(240,235,224,0.74)]">{storageSummary}</p>
                        </div>
                        <div className="rounded-[18px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-4">
                          <h4 className="text-[1rem] font-semibold text-[#f0ebe0]">Hạn sử dụng</h4>
                          <p className="mt-2 text-[14px] leading-7 text-[rgba(240,235,224,0.74)]">{shelfLife}</p>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {activeTab === 'reviews' ? <div className="min-h-[120px]" aria-hidden="true" /> : null}
                </div>
              </div>

              {relatedProducts.length > 0 ? (
                <section className="space-y-6 pt-2">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.22em] text-[rgba(224,180,62,0.75)]">Khám phá thêm</p>
                      <h2 className="mt-2 text-[2rem] leading-none text-[#f0ebe0]" style={{ fontFamily: 'var(--font-display)', fontWeight: 300 }}>
                        Sản phẩm liên quan
                      </h2>
                    </div>
                    <Link href="/products" className="text-[12px] uppercase tracking-[0.2em] text-[rgba(240,235,224,0.58)] transition hover:text-[#e0b43e]">
                      Xem toàn bộ
                    </Link>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {relatedProducts.map((relatedProduct) => (
                      <RelatedProductCard key={relatedProduct.id} product={relatedProduct} />
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          )}
        </section>
      </div>

      <div className={`fixed bottom-5 right-5 z-[80] transition ${toastMessage ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'}`}>
        <div className="rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[#11100d] px-4 py-3 text-sm text-[#f0ebe0] shadow-[0_18px_45px_rgba(0,0,0,0.3)]">
          {toastMessage}
        </div>
      </div>
    </>
  );
}
