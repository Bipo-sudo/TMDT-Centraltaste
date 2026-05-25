'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Wheat, Quote, BookOpenText, Sparkles, Gem, Compass } from 'lucide-react';


function GoldRule() {
  return <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/50 to-transparent opacity-30 my-12" />;
}

function EditorialCard({ eyebrow, title, body, accent = false }) {
  return (
    <article className={`rounded-[28px] border p-6 sm:p-7 ${accent ? 'border-[rgba(201,168,76,0.22)] bg-[linear-gradient(180deg,rgba(201,168,76,0.08),rgba(255,255,255,0.02))]' : 'border-[rgba(201,168,76,0.12)] bg-[rgba(255,255,255,0.03)]'}`}>
      <p className="text-[10px] uppercase tracking-[0.34em] text-[rgba(201,168,76,0.7)]">{eyebrow}</p>
      <h3 className="mt-4 font-display text-2xl font-light text-[#f0ebe0] sm:text-3xl">{title}</h3>
      <p className="mt-4 text-sm leading-7 text-[rgba(240,235,224,0.64)]">{body}</p>
    </article>
  );
}

function MiniStat({ value, label }) {
  return (
    <div className="rounded-[24px] border border-[rgba(201,168,76,0.12)] bg-[rgba(255,255,255,0.03)] p-5">
      <p className="text-[11px] uppercase tracking-[0.28em] text-[rgba(201,168,76,0.64)]">{label}</p>
      <p className="mt-3 font-display text-3xl font-light text-[#f0ebe0]">{value}</p>
    </div>
  );
}

export default function BrandStoryPage() {
  return (
    <div className="min-h-screen bg-[#0b0a07] text-[#f0ebe0]">
      <section className="relative overflow-hidden border-b border-[rgba(201,168,76,0.12)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,168,76,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_26%),linear-gradient(180deg,#120f0a_0%,#0b0a07_70%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(201,168,76,0.7)] to-transparent opacity-60" />

        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_320px] lg:px-8 lg:pb-20 lg:pt-14">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-3 rounded-full border border-[rgba(201,168,76,0.22)] bg-[rgba(255,255,255,0.03)] px-4 py-2 text-[10px] uppercase tracking-[0.36em] text-[rgba(201,168,76,0.82)]">
              <span className="h-2 w-2 rounded-full bg-[#c9a84c]" />
              Brand Story / Editorial Issue 01
            </div>

            <div className="max-w-4xl space-y-6">
              <p className="text-[10px] uppercase tracking-[0.44em] text-[rgba(201,168,76,0.68)]">CentralTaste Magazine</p>
              <h1 className="font-display text-5xl font-light tracking-[-0.05em] text-[#f5efe2] sm:text-6xl lg:text-7xl">
                Dấu ấn tinh hoa, <em className="italic text-[#c9a84c]">được kể như một bài xã luận sang trọng</em>.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[rgba(240,235,224,0.62)] sm:text-xl">
                Từ cội nguồn làng nghề trăm năm đến bàn tiệc hiện đại, CentralTaste chọn cách kể chuyện như một tạp chí cao cấp: tinh gọn, có chiều sâu, và tôn vinh giá trị nguyên bản của miền Trung.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <MiniStat value="01" label="Nguồn cội" />
              <MiniStat value="02" label="Chất phác" />
              <MiniStat value="03" label="Chắt lọc" />
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:block"
          >
            <div className="sticky top-24 space-y-4 rounded-[28px] border border-[rgba(201,168,76,0.12)] bg-[rgba(255,255,255,0.03)] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
              <p className="text-[10px] uppercase tracking-[0.34em] text-[rgba(201,168,76,0.72)]">Mục lục</p>
              <nav className="space-y-3 text-sm text-[rgba(240,235,224,0.66)]">
                <a href="#section-origin" className="flex items-center justify-between rounded-[16px] border border-transparent px-3 py-3 transition hover:border-[rgba(201,168,76,0.16)] hover:bg-[rgba(201,168,76,0.05)] hover:text-[#f5efe2]">
                  <span>01. Nguồn cội</span>
                  <Compass size={15} />
                </a>
                <a href="#section-craft" className="flex items-center justify-between rounded-[16px] border border-transparent px-3 py-3 transition hover:border-[rgba(201,168,76,0.16)] hover:bg-[rgba(201,168,76,0.05)] hover:text-[#f5efe2]">
                  <span>02. Chất phác</span>
                  <Wheat size={15} />
                </a>
                <a href="#section-curation" className="flex items-center justify-between rounded-[16px] border border-transparent px-3 py-3 transition hover:border-[rgba(201,168,76,0.16)] hover:bg-[rgba(201,168,76,0.05)] hover:text-[#f5efe2]">
                  <span>03. Chắt lọc</span>
                  <Sparkles size={15} />
                </a>
                <a href="#section-promise" className="flex items-center justify-between rounded-[16px] border border-transparent px-3 py-3 transition hover:border-[rgba(201,168,76,0.16)] hover:bg-[rgba(201,168,76,0.05)] hover:text-[#f5efe2]">
                  <span>04. Cam kết</span>
                  <BookOpenText size={15} />
                </a>
              </nav>

              <div className="rounded-[22px] border border-[rgba(201,168,76,0.12)] bg-[linear-gradient(180deg,rgba(201,168,76,0.08),rgba(255,255,255,0.02))] p-5">
                <p className="text-[10px] uppercase tracking-[0.32em] text-[rgba(201,168,76,0.7)]">Ghi chú biên tập</p>
                <p className="mt-3 text-sm leading-7 text-[rgba(240,235,224,0.68)]">
                  Trang này được dàn dựng theo tinh thần magazine: nhiều khoảng thở, nhịp đọc chậm, và các khối nội dung như trang xã luận của một ấn phẩm cao cấp.
                </p>
              </div>
            </div>
          </motion.aside>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.55fr)] lg:items-start">
          <div className="space-y-10">
            <section id="section-origin" className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
              <div className="lg:sticky lg:top-28 lg:self-start">
                <p className="text-[10px] uppercase tracking-[0.36em] text-[rgba(201,168,76,0.66)]">Chương 01</p>
                <h2 className="mt-3 font-display text-4xl font-light text-[#f5efe2] sm:text-5xl">Nguồn cội</h2>
                <div className="mt-6 h-px w-20 bg-[linear-gradient(90deg,#c9a84c,transparent)]" />
              </div>

              <div className="space-y-6">
                <div className="rounded-[32px] border border-[rgba(201,168,76,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-6 sm:p-8">
                  <p className="text-[11px] uppercase tracking-[0.34em] text-[rgba(201,168,76,0.7)]">Lead story</p>
                  <p className="mt-4 max-w-2xl text-base leading-8 text-[rgba(240,235,224,0.7)] sm:text-lg">
                    Miền Trung Việt Nam là một dải đất khắc nghiệt nhưng giàu bản sắc. Nắng, gió và mưa tạo nên những sản vật có cá tính riêng, và chính điều đó làm nên chất vị mà CentralTaste muốn tôn vinh.
                  </p>
                  <p className="mt-4 max-w-2xl text-base leading-8 text-[rgba(240,235,224,0.7)] sm:text-lg">
                    Chúng tôi tin rằng cội nguồn của sự xa xỉ không đến từ sự phô trương, mà từ tính nguyên bản, từ lớp bùn đất của quê hương, và từ sự bền bỉ của những nghệ nhân thầm lặng.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <EditorialCard
                    eyebrow="Ảnh hưởng địa lý"
                    title="Một vùng đất tạo ra hương vị có bản sắc"
                    body="Dải đất hẹp nhưng đầy đối nghịch khiến nông sản miền Trung có độ đậm, độ mặn, độ thơm rất riêng. Đó là nền tảng đầu tiên của câu chuyện thương hiệu."
                  />
                  <EditorialCard
                    eyebrow="Di sản"
                    title="Mỗi công thức là một ký ức được trao truyền"
                    body="Từ làng nghề đến bàn ăn hiện đại, CentralTaste giữ vai trò phiên dịch: đưa giá trị truyền thống bước vào đời sống mới mà không làm mất đi chất gốc."
                    accent
                  />
                </div>
              </div>
            </section>

            <GoldRule />

            <section id="section-craft" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-10">
              <div className="rounded-[34px] border border-[rgba(201,168,76,0.12)] bg-[rgba(255,255,255,0.03)] p-6 sm:p-8 lg:p-10">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.36em] text-[rgba(201,168,76,0.66)]">Chương 02</p>
                    <h2 className="mt-3 font-display text-4xl font-light text-[#f5efe2] sm:text-5xl">Tinh thần chất phác</h2>
                  </div>
                  <Wheat size={64} className="hidden text-[rgba(201,168,76,0.22)] sm:block" />
                </div>

                <div className="mt-8 grid gap-6 md:grid-cols-2">
                  <p className="text-base leading-8 text-[rgba(240,235,224,0.68)] sm:text-lg">
                    Chúng tôi lội ngược dòng những ồn ào của nền công nghiệp thực phẩm nhanh, tìm về những ngôi làng nhỏ khuất sau rặng tre. Ở đó, có những gia tộc ba đời chỉ làm đúng một việc: ủ mắm, tráng bánh, hay sên kẹo.
                  </p>
                  <p className="text-base leading-8 text-[rgba(240,235,224,0.68)] sm:text-lg">
                    Chất phác là khi người nghệ nhân nhất quyết chờ đủ nắng mới phơi bánh tráng, dẫu đơn hàng hối thúc. Đó là sự cố chấp đầy tự trọng. Chúng tôi không can thiệp vào công thức, chúng tôi chỉ nâng niu và bảo chứng cho sự thuần khiết ấy.
                  </p>
                </div>

                <div className="mt-8 rounded-[28px] border border-[rgba(201,168,76,0.12)] bg-[linear-gradient(135deg,rgba(201,168,76,0.07),rgba(255,255,255,0.02))] p-6 sm:p-7">
                  <div className="flex items-start gap-4">
                    <Quote size={24} className="mt-1 shrink-0 text-[rgba(201,168,76,0.75)]" />
                    <p className="font-display text-2xl font-light italic leading-[1.45] text-[#f5efe2] sm:text-3xl">
                      Vẻ đẹp thực sự không nằm ở sự phô trương, nó nằm ở sự kiên định với những điều tử tế nhất.
                    </p>
                  </div>
                </div>
              </div>

              <aside className="space-y-4">
                <div className="rounded-[28px] border border-[rgba(201,168,76,0.12)] bg-[rgba(255,255,255,0.03)] p-6">
                  <p className="text-[10px] uppercase tracking-[0.34em] text-[rgba(201,168,76,0.66)]">Biên tập</p>
                  <p className="mt-4 text-sm leading-7 text-[rgba(240,235,224,0.66)]">
                    Mỗi nguyên liệu được lựa chọn theo cùng một tiêu chí: nguồn gốc rõ ràng, quy trình chuẩn, và khả năng truyền tải câu chuyện vùng miền một cách chân thật nhất.
                  </p>
                </div>
                <div className="rounded-[28px] border border-[rgba(201,168,76,0.12)] bg-[rgba(255,255,255,0.03)] p-6">
                  <p className="text-[10px] uppercase tracking-[0.34em] text-[rgba(201,168,76,0.66)]">Từ khóa</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {['nguyên bản', 'thủ công', 'làng nghề', 'di sản', 'cao cấp'].map((item) => (
                      <span key={item} className="rounded-full border border-[rgba(201,168,76,0.14)] px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[rgba(240,235,224,0.58)]">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </aside>
            </section>

            <GoldRule />

            <section id="section-curation" className="space-y-8">
              <div className="max-w-3xl">
                <p className="text-[10px] uppercase tracking-[0.36em] text-[rgba(201,168,76,0.66)]">Chương 03</p>
                <h2 className="mt-3 font-display text-4xl font-light text-[#f5efe2] sm:text-5xl">Nghệ thuật của sự chắt lọc</h2>
                <p className="mt-5 text-base leading-8 text-[rgba(240,235,224,0.68)] sm:text-lg">
                  Đem cái chân phương bước vào không gian đương đại là một nghệ thuật. Chúng tôi rũ bỏ sự rườm rà, giữ lại linh hồn. Mỗi sản phẩm của CentralTaste trước khi đến tay bạn đã vượt qua những tiêu chuẩn khắt khe nhất về định lượng, thẩm mỹ và tính an toàn.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { t: 'Golden Ratio', d: 'Tỷ lệ vàng trong chế tác.' },
                  { t: 'Purity', d: 'Độ trong vắt của nước dùng di sản.' },
                  { t: 'Elegance', d: 'Trình diễn ẩm thực tại bàn tiệc.' },
                ].map((item) => (
                  <EditorialCard key={item.t} eyebrow="Editorial Note" title={item.t} body={item.d} />
                ))}
              </div>

              <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
                <div className="rounded-[32px] border border-[rgba(201,168,76,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-6 sm:p-8">
                  <p className="text-[10px] uppercase tracking-[0.34em] text-[rgba(201,168,76,0.66)]">Curation Lens</p>
                  <p className="mt-4 text-base leading-8 text-[rgba(240,235,224,0.68)] sm:text-lg">
                    Trung tâm của thương hiệu không phải là bán nhiều hơn, mà là chọn ít hơn, chọn tốt hơn, và để mỗi hộp quà có đủ độ sang trọng để được trao như một lời chúc có ý nghĩa.
                  </p>
                </div>

                <div className="rounded-[32px] border border-[rgba(201,168,76,0.12)] bg-[rgba(201,168,76,0.05)] p-6 sm:p-8">
                  <div className="flex items-center gap-3 text-[rgba(201,168,76,0.82)]">
                    <Gem size={18} />
                    <p className="text-[10px] uppercase tracking-[0.34em]">Premium Standard</p>
                  </div>
                  <p className="mt-4 font-display text-2xl font-light leading-[1.45] text-[#f5efe2] sm:text-3xl">
                    Tinh tế ở hình thức, chính gốc ở nội dung.
                  </p>
                  <p className="mt-4 text-sm leading-7 text-[rgba(240,235,224,0.66)]">
                    Đây là tinh thần mà trang thương hiệu muốn truyền đạt: vừa sang trọng để thuyết phục thị giác, vừa chân thật để giữ niềm tin.
                  </p>
                </div>
              </div>
            </section>

            <GoldRule />

            <section id="section-promise" className="rounded-[36px] border border-[rgba(201,168,76,0.16)] bg-[linear-gradient(180deg,rgba(201,168,76,0.08),rgba(255,255,255,0.02))] p-6 sm:p-8 lg:p-10">
              <div className="max-w-3xl">
                <p className="text-[10px] uppercase tracking-[0.36em] text-[rgba(201,168,76,0.66)]">Chương 04</p>
                <h2 className="mt-3 font-display text-4xl font-light italic text-[#c9a84c] sm:text-5xl">Lời cam kết di sản</h2>
                <p className="mt-5 text-base leading-8 text-[rgba(240,235,224,0.7)] sm:text-lg">
                  Mỗi hộp quà bạn nhận được mang theo hơi thở của đất, mồ hôi của người thợ và chuẩn mực của một thương hiệu cao cấp. Chúng tôi làm việc trực tiếp với làng nghề để đảm bảo dòng chảy giá trị được trao lại xứng đáng cho những người gìn giữ văn hóa.
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link href="/products" className="inline-flex items-center justify-center gap-3 rounded-full bg-[#c9a84c] px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#1a1208] transition hover:brightness-110">
                  Khám phá sản phẩm <ArrowRight size={16} />
                </Link>
                <Link href="/" className="inline-flex items-center justify-center gap-3 rounded-full border border-[rgba(201,168,76,0.18)] px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-[rgba(240,235,224,0.78)] transition hover:border-[rgba(201,168,76,0.35)] hover:text-[#f5efe2]">
                  Về trang chủ
                </Link>
              </div>
            </section>
          </div>

          <aside className="space-y-4 lg:pt-1">
            <div className="rounded-[32px] border border-[rgba(201,168,76,0.12)] bg-[rgba(255,255,255,0.03)] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.14)] lg:sticky lg:top-28">
              <p className="text-[10px] uppercase tracking-[0.34em] text-[rgba(201,168,76,0.66)]">Executive Summary</p>
              <h3 className="mt-4 font-display text-3xl font-light text-[#f5efe2]">Cốt lõi thương hiệu</h3>
              <ul className="mt-5 space-y-4 text-sm leading-7 text-[rgba(240,235,224,0.68)]">
                <li className="border-b border-[rgba(201,168,76,0.08)] pb-4">• Đặc sản miền Trung được tuyển chọn từ làng nghề và vùng nguyên liệu rõ nguồn gốc.</li>
                <li className="border-b border-[rgba(201,168,76,0.08)] pb-4">• Trình bày sang trọng, tối giản, gợi cảm giác một ấn phẩm biên tập cao cấp.</li>
                <li className="border-b border-[rgba(201,168,76,0.08)] pb-4">• Nhấn mạnh tính nguyên bản, sự chân phương và giá trị quà tặng.</li>
              </ul>
            </div>

            <div className="rounded-[32px] border border-[rgba(201,168,76,0.12)] bg-[rgba(255,255,255,0.03)] p-6">
              <p className="text-[10px] uppercase tracking-[0.34em] text-[rgba(201,168,76,0.66)]">Quote</p>
              <p className="mt-4 text-lg leading-8 text-[rgba(240,235,224,0.72)]">
                “Chúng tôi không thay thế làng nghề. Chúng tôi làm nhiệm vụ nâng niu câu chuyện của làng nghề để câu chuyện ấy đi xa hơn.”
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
