import { forwardRef, useCallback } from 'react'

import {
  type UseHeadingConfig,
  type Level,
  useHeading,
  HEADING_SHORTCUT_KEYS,
} from './useHeading'

import { Button, type ButtonProps } from '@/components/ui-primitive/button'

import { parseShortcutKeys } from '@/utils/common'

import { useTiptapEditor } from '@/hooks'

export interface HeadingButtonProps
  extends Omit<ButtonProps, 'type'>, UseHeadingConfig {
  /**
   * 文字
   */
  text?: string
  /**
   * 是否显示快捷键
   * @default false
   */
  showShortcut?: boolean
}

export function HeadingShortcutBadge({
  level,
  shortcutKeys = HEADING_SHORTCUT_KEYS[level],
}: {
  level: Level
  shortcutKeys?: string
}) {
  return (
    <div className='xt-button-shortcut-text'>
      {parseShortcutKeys({ shortcutKeys })}
    </div>
  )
}

/**
 * 用于在编辑器中切换标题的按钮组件。
 */
export const HeadingButton = forwardRef<HTMLButtonElement, HeadingButtonProps>(
  (
    {
      editor: providedEditor,
      level,
      text,
      hideWhenUnavailable = false,
      onToggled,
      showShortcut = false,
      onClick,
      children,
      ...buttonProps
    },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor)

    const {
      isVisible,
      canToggle,
      isActive,
      handleToggle,
      label,
      Icon,
      shortcutKeys,
    } = useHeading({
      editor,
      level,
      hideWhenUnavailable,
      onToggled,
    })

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        handleToggle()
      },
      [handleToggle, onClick]
    )

    if (!isVisible) {
      return null
    }

    return (
      <Button
        type='button'
        data-style='ghost'
        data-active-state={isActive ? 'on' : 'off'}
        role='button'
        tabIndex={-1}
        disabled={!canToggle}
        data-disabled={!canToggle}
        aria-label={label}
        aria-pressed={isActive}
        tooltip={label}
        onClick={handleClick}
        {...buttonProps}
        ref={ref}
      >
        {children ?? (
          <>
            <Icon className='xt-button-icon' />
            {text && (
              <span
                className='xt-button-text'
                style={{ userSelect: 'none' }}
              >
                {text}
              </span>
            )}
            {showShortcut && (
              <HeadingShortcutBadge
                level={level}
                shortcutKeys={shortcutKeys}
              />
            )}
          </>
        )}
      </Button>
    )
  }
)

HeadingButton.displayName = 'HeadingButton'
