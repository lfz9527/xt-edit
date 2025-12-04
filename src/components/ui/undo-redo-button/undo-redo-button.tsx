import { forwardRef, useCallback } from 'react'

import {
  type ButtonProps,
  Button,
} from '@components/ui-primitive/button/button'
import { type UseUndoRedoConfig, useUndoRedo } from './useUndoRedo'

export interface UndoRedoButtonProps
  extends Omit<ButtonProps, 'type'>, UseUndoRedoConfig {
  /**
   * 是否显示按钮快捷键
   * @default false
   */
  showShortcut?: boolean
}

/**
 * 用于在编辑器中触发撤销/重复操作的按钮组件。
 */
export const UndoRedoButton = forwardRef<
  HTMLButtonElement,
  UndoRedoButtonProps
>(
  (
    {
      editor,
      action,
      hideWhenUnavailable,
      onExecuted,
      onClick,
      children,
      showShortcut,
      ...buttonProps
    },
    ref
  ) => {
    const { isVisible, handleAction, label, canExecute, Icon } = useUndoRedo({
      editor,
      action,
      onExecuted,
      hideWhenUnavailable,
    })

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        handleAction()
      },
      [handleAction, onClick]
    )

    if (!isVisible) {
      return null
    }

    return (
      <Button
        data-style='ghost'
        disabled={!canExecute}
        data-disabled={!canExecute}
        role='button'
        tabIndex={-1}
        aria-label={label}
        tooltip={label}
        onClick={handleClick}
        {...buttonProps}
        ref={ref}
      >
        <Icon size={16} />
      </Button>
    )
  }
)

UndoRedoButton.displayName = 'UndoRedoButton'
