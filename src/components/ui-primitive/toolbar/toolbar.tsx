import { forwardRef, useRef } from 'react'
import { cn } from '@/utils'
import { useComposedRef } from '@/hooks'
import './toolbar.less'

type BaseProps = React.HTMLAttributes<HTMLDivElement>

interface ToolbarProps extends BaseProps {
  variant?: 'floating' | 'fixed'
}

export const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>(
  ({ children, className, variant, ...props }, ref) => {
    const devRef = useRef<HTMLDivElement>(null)
    const composeRef = useComposedRef(devRef, ref)

    return (
      <div
        ref={composeRef}
        role='toolbar'
        aria-label='toolbar'
        data-variant={variant}
        className={cn('xt-toolbar', className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Toolbar.displayName = 'Toolbar'

export const ToolbarGroup = forwardRef<HTMLDivElement, BaseProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      role='group'
      className={cn('xt-toolbar-group', className)}
      {...props}
    >
      {children}
    </div>
  )
)
ToolbarGroup.displayName = 'ToolbarGroup'
