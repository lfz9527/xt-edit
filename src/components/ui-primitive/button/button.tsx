import { forwardRef, useMemo } from 'react'
import { cn, parseShortcutKeys } from '@utils/common'
import './button.less'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
  // 快捷键
  shortcutKeys?: string
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, children, shortcutKeys, 'aria-label': ariaLabel, ...props },
    ref
  ) => {
    // 快捷键格式化
    const shortcuts = useMemo<string[]>(
      () => parseShortcutKeys({ shortcutKeys }),
      [shortcutKeys]
    )

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
)

Button.displayName = 'Button'
