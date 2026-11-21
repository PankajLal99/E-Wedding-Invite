export default function FloralCorners({
  variant = 'default',
}: {
  variant?: 'default' | 'compact'
}) {
  const cls = variant === 'compact' ? 'floral-corner floral-corner--compact' : 'floral-corner'

  return (
    <img
      className={`${cls} floral-corner--lotus floral-corner--bl`}
      src="/brand/lotus-corner.png"
      alt=""
      aria-hidden="true"
    />
  )
}
