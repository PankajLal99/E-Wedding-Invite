import Lotus from './decor/Lotus'
import './decor/decor.css'

export default function FloralCorners({
  variant = 'default',
}: {
  variant?: 'default' | 'compact'
}) {
  const cls = variant === 'compact' ? 'floral-corner floral-corner--compact' : 'floral-corner'

  return (
    <>
      <Lotus className={`${cls} floral-corner--lotus floral-corner--bl`} />
    </>
  )
}
