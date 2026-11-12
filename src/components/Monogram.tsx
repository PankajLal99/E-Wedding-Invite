type Props = {
  className?: string
  variant?: 'full' | 'badge'
  title?: string
}

/** The gold lotus monogram (artwork supplied by the couple) */
export default function Monogram({ className, title }: Props) {
  return (
    <img
      className={className}
      src="/brand/monogram.png"
      alt={title ?? ''}
      aria-hidden={title ? undefined : true}
      width={813}
      height={729}
      decoding="async"
      draggable={false}
    />
  )
}
