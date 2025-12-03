import cs from 'classnames'
import SvgIcon from '@components/SvgIcon'

interface LoadingProps {
  className?: string
}

const Loading = (props: LoadingProps) => {
  const { className } = props
  const classNames = cs('flex items-center justify-center', className)
  return (
    <div className={classNames}>
      <SvgIcon name='loading' />
    </div>
  )
}

export default Loading
