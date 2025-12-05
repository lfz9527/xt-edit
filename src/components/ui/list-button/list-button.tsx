import { forwardRef, useCallback } from 'react'

import { parseShortcutKeys } from '@/utils'

import { useEditor } from '@/hooks'

import { Button, type ButtonProps } from '@/components/ui-primitive/button'

import {
  LIST_SHORTCUT_KEYS,
  useList,
  type ListType,
  type UseListConfig,
} from './index'

export interface ListButtonProps
  extends Omit<ButtonProps, 'type'>, UseListConfig {
  /**
   * Optional text to display alongside the icon.
   */
  text?: string
  /**
   * 是否显示快捷键
   * @default false
   */
  showShortcut?: boolean
}

export function ListShortcutBadge({
  type,
  shortcutKeys = LIST_SHORTCUT_KEYS[type],
}: {
  type: ListType
  shortcutKeys?: string
}) {
  return (
    <div className='xt-button-shortcut-text'>
      {parseShortcutKeys({ shortcutKeys })}
    </div>
  )
}

export const ListButton = forwardRef<HTMLButtonElement, ListButtonProps>(
  (
    {
      editor: providedEditor,
      type,
      text,
      hideWhenUnavailable = false,
      onToggled,
      showShortcut = true,
      onClick,
      children,
      ...buttonProps
    },
    ref
  ) => {
    const { editor } = useEditor(providedEditor)
    const {
      isVisible,
      canToggle,
      isActive,
      handleToggle,
      label,
      shortcutKeys,
      Icon,
    } = useList({
      editor,
      type,
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
            <Icon size={16} />
            {text && <span className='xt-button-text'>{text}</span>}
            {showShortcut && (
              <ListShortcutBadge
                type={type}
                shortcutKeys={shortcutKeys}
              />
            )}
          </>
        )}
      </Button>
    )
  }
)

ListButton.displayName = 'ListButton'
