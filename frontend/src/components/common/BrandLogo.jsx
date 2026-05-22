export default function BrandLogo({
  className = '',
  width = 160,
  height = 48,
  variant = 'dark',
  showWordmark = true,
}) {
  const isLight = variant === 'light';

  return (
    <span className={`inline-flex items-center gap-3 ${className}`.trim()}>
      <img
        src="/assets/images/logo.svg"
        alt="CentralTaste"
        width={width}
        height={height}
        className="block object-contain"
        style={{
          width,
          height,
          filter: isLight ? 'brightness(0) invert(1)' : 'none',
        }}
      />
      {showWordmark ? (
        <span
          className={`text-[11px] font-semibold uppercase tracking-[0.42em] ${
            isLight ? 'text-white/90' : 'text-neutral-900'
          }`}
        >
          CentralTaste
        </span>
      ) : null}
    </span>
  );
}
