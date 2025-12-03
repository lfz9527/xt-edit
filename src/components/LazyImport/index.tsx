import Loading from '@/components/Loading'
import {
  type ComponentType,
  type FC,
  type LazyExoticComponent,
  Suspense,
} from 'react'

interface LazyImportProps {
  lazy?: LazyExoticComponent<ComponentType>
}

const LazyImport: FC<LazyImportProps> = ({ lazy }) => {
  const Component = lazy ? lazy : () => null
  return (
    <Suspense fallback={<Loading className='h-screen' />}>
      <Component />
    </Suspense>
  )
}

export default LazyImport
