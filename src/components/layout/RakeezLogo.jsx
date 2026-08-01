/** أيقونة ركيز — تُستخدم في الشعار والصفحات العامة */
export function RakeezLogo({ size = 50, className = '' }) {
  const px = typeof size === 'number' ? `${size}px` : size

  return (
    <img
      src="/favicon.svg"
      alt=""
      aria-hidden
      width={size}
      height={size}
      className={`shrink-0 rounded-xl shadow-md shadow-primary/20 ${className}`}
      style={{ width: px, height: px }}
    />
  )
}
