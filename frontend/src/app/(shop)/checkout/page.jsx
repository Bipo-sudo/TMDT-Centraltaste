export default function CheckoutPage() {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-4 rounded-[32px] border border-neutral-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
        <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">Shop</p>
        <h1 className="text-4xl font-semibold tracking-[-0.04em] text-neutral-950">Thanh toán</h1>
        <p className="text-base leading-7 text-neutral-600">
          Đây là không gian cho payment form, shipping address, và luồng tạo đơn.
        </p>
      </div>
    </section>
  );
}
