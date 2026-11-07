import Lotus from './decor/Lotus'
import PeacockFeather from './decor/PeacockFeather'
import './decor/decor.css'

export default function FloralCorners({
  variant = 'default',
}: {
  variant?: 'default' | 'compact'
}) {
  const cls = variant === 'compact' ? 'floral-corner floral-corner--compact' : 'floral-corner'

  return (
    <>
      <PeacockFeather className={`${cls} floral-corner--feather floral-corner--tr`} />
      <Lotus className={`${cls} floral-corner--lotus floral-corner--bl`} />
    </>
  )
}
