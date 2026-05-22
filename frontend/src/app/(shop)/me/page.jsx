export default function ProfilePage() {
  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-[32px] border border-neutral-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
        <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">Account</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-neutral-950">Hồ sơ của tôi</h1>
        <p className="mt-3 text-base leading-7 text-neutral-600">
          Route này là chỗ gắn profile, địa chỉ mặc định, và lịch sử đơn hàng.
        </p>
      </div>
    </section>
  );
}
