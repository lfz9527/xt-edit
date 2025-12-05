import { forwardRef, useMemo, Fragment } from 'react'
import { cn, parseShortcutKeys } from '@/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui-primitive/tooltip'
import './button.less'
import './button-group.less'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
  // 快捷键
  shortcutKeys?: string
  showTooltip?: boolean
  tooltip?: React.ReactNode
}

export const ShortcutDisplay: React.FC<{ shortcuts: string[] }> = ({
  shortcuts,
}) => {
  if (shortcuts.length === 0) return null

  return (
    <div>
      {shortcuts.map((key, index) => (
        <Fragment key={index}>
          {index > 0 && <kbd>+</kbd>}
          <kbd>{key}</kbd>
        </Fragment>
      ))}
    </div>
  )
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      shortcutKeys,
      tooltip,
      showTooltip,
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) => {
    // 快捷键格式化
    const shortcuts = useMemo<string[]>(
      () => parseShortcutKeys({ shortcutKeys }),
      [shortcutKeys]
    )

    if (!tooltip || !showTooltip) {
      return (
        <button
          className={cn('xt-button', className)}
          ref={ref}
          aria-label={ariaLabel}
          {...props}
        >
          {children}
          {shortcuts}
        </button>
      )
    }

    return (
      <Tooltip delay={200}>
        <TooltipTrigger
          className={cn('xt-button', className)}
          ref={ref}
          aria-label={ariaLabel}
          {...props}
        >
          {children}
        </TooltipTrigger>
        <TooltipContent>
          {tooltip}
          <ShortcutDisplay shortcuts={shortcuts} />
        </TooltipContent>
      </Tooltip>
    )
  }
)

Button.displayName = 'Button'

export const ButtonGroup = forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    orientation?: 'horizontal' | 'vertical'
  }
>(({ className, children, orientation = 'vertical', ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('xt-button-group', className)}
      data-orientation={orientation}
      role='group'
      {...props}
    >
      {children}
    </div>
  )
})
ButtonGroup.displayName = 'ButtonGroup'

export default Button
