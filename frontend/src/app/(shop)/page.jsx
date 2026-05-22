"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BadgeCheck, Clock3, Leaf } from 'lucide-react';
import BrandLogo from '../../components/common/BrandLogo';
import api from '../../lib/api';

const brandPillars = [
  {
    icon: Leaf,
    title: 'Sạch và chuẩn vị',
    description: 'Nguyên liệu được chọn lọc theo hướng tối giản, rõ nguồn gốc và dễ truy xuất.',
  },
  {
    icon: Clock3,
    title: 'Giao diện gọn',
    description: 'Layout tách biệt theo Route Group để luồng mua hàng và luồng quản trị không chồng lên nhau.',
  },
  {
    icon: BadgeCheck,
    title: 'MVP sẵn sàng mở rộng',
    description: 'Checkout, cart, profile, và UploadThing đã có chỗ để gắn vào ngay từ kiến trúc nền.',
  },
];

function ProductCard({ product }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[32px] border border-neutral-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
        <img
          src={product.main_image_url || 'https://via.placeholder.com/400'}
          alt={product.name_vi}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-neutral-400">Trending</p>
          <h3 className="mt-2 text-lg font-semibold text-neutral-950">{product.name_vi}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-600">
            {product.summary_vi || 'Mô tả sản phẩm đang được cập nhật.'}
          </p>
        </div>
        <div className="mt-auto flex items-center justify-between gap-4">
          <span className="text-sm font-semibold text-neutral-950">
            {Number(product.price_vnd || 0).toLocaleString('vi-VN')} VND
          </span>
          <Link
            href={`/products/${product.id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-neutral-950 transition hover:gap-3"
          >
            Xem chi tiết <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function HomePage() {
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Hàm gọi API nằm trong useEffect để tránh render lặp vô tận
    const fetchTrendingProducts = async () => {
      try {
        const response = await api.get('/products/trending');
        // Tuỳ theo cách bạn chuẩn hoá response ở backend, thường sẽ là response.data.data
        const products = response.data?.data || response.data?.data?.products || [];
        setTrendingProducts(products);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm trending:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingProducts();
  }, []); // Mảng rỗng [] đảm bảo chỉ gọi API 1 lần duy nhất khi trang web mở lên

  return (
    <div className="relative overflow-hidden bg-[#fbfaf7]">
      <section className="relative mx-auto flex w-full max-w-7xl flex-col gap-16 px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pb-28 lg:pt-20">
        <div className="absolute inset-x-0 top-0 -z-10 h-[38rem] bg-[radial-gradient(circle_at_top,_rgba(214,196,156,0.22),_transparent_55%)]" />
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-8">
            <span className="inline-flex rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.32em] text-neutral-500">
              Clean architecture for shop + admin
            </span>
            <div className="space-y-5">
              <p className="text-sm uppercase tracking-[0.38em] text-neutral-400">CentralTaste</p>
              <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.05em] text-neutral-950 sm:text-6xl lg:text-7xl">
                Một hệ thống sáng, sạch và tách bạch cho thương mại điện tử thực phẩm.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-neutral-600 sm:text-lg">
                Từ shopping experience đến admin console, mọi thứ được quy hoạch lại bằng Route Groups,
                component split, và asset management rõ ràng ngay từ đầu.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex h-12 items-center justify-center rounded-full bg-neutral-950 px-6 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Khám phá sản phẩm
              </Link>
              <Link
                href="/admin/dashboard"
                className="inline-flex h-12 items-center justify-center rounded-full border border-neutral-200 bg-white px-6 text-sm font-medium text-neutral-950 transition hover:border-neutral-300 hover:bg-neutral-50"
              >
                Vào admin
              </Link>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="relative"
          >
            <div className="absolute inset-0 -z-10 rounded-[40px] bg-gradient-to-br from-white via-[#f7f4ed] to-[#efe6d3] shadow-[0_30px_80px_rgba(15,23,42,0.08)]" />
            <div className="grid gap-6 p-8 sm:p-10">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Brand mark</p>
                  <BrandLogo className="mt-4" width={210} height={64} showWordmark={false} />
                </div>
                <div className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-medium text-neutral-500">
                  01 / 03
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {brandPillars.map((pillar) => {
                  const Icon = pillar.icon;
                  return (
                    <div key={pillar.title} className="rounded-[28px] border border-white/70 bg-white/75 p-5 backdrop-blur-sm">
                      <Icon className="h-5 w-5 text-neutral-900" />
                      <h2 className="mt-6 text-base font-semibold text-neutral-950">{pillar.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-neutral-600">{pillar.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-6 border-t border-neutral-200 pt-8">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">Trending products</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-neutral-950 sm:text-3xl">
              Các sản phẩm đang được quan tâm nhất.
            </h2>
          </div>
          <Link href="/products" className="hidden text-sm font-medium text-neutral-500 transition hover:text-neutral-950 sm:inline-flex">
            Xem toàn bộ
          </Link>
        </div>

        <div className="mt-10">
          {isLoading ? (
            <div className="flex justify-center py-20 text-neutral-500">Đang tải sản phẩm...</div>
          ) : trendingProducts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {trendingProducts.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          ) : (
            <div className="rounded-[32px] border border-dashed border-neutral-200 bg-white p-10 text-sm text-neutral-500 text-center">
              Chưa có dữ liệu trending. Hãy chạy seed dữ liệu backend để thấy danh sách sản phẩm.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}