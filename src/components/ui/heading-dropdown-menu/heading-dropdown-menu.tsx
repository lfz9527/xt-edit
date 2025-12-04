import { forwardRef, useState, useCallback } from 'react'
import { ChevronDown } from 'lucide-react'

import {
  type ButtonProps,
  Button,
  ButtonGroup,
} from '@/components/ui-primitive/button'
import { Card, CardBody } from '@/components/ui-primitive/card'

import { HeadingButton } from '@/components/ui/heading-button'

import {
  type UseHeadingDropdownMenuConfig,
  useHeadingDropdownMenu,
} from './useHeadingDropdownMenu'

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui-primitive/dropdown-menu'

import { useEditor } from '@/hooks'

import './heading-dropdown-menu.less'

export interface HeadingDropdownMenuProps
  extends Omit<ButtonProps, 'type'>, UseHeadingDropdownMenuConfig {
  /**
   *是否将下拉菜单渲染到 portal 中
   * @default false
   */
  portal?: boolean
  /**
   * dropdown 开启或关闭回调
   */
  onOpenChange?: (isOpen: boolean) => void
}

export const HeadingDropdownMenu = forwardRef<
  HTMLButtonElement,
  HeadingDropdownMenuProps
>(
  (
    {
      editor: providedEditor,
      levels = [1, 2, 3, 4, 5, 6],
      hideWhenUnavailable = false,
      portal = false,
      onOpenChange,
      ...buttonProps
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const { editor } = useEditor(providedEditor)
    const { isVisible, isActive, canToggle, Icon, label } =
      useHeadingDropdownMenu({
        levels,
        hideWhenUnavailable,
      })

    const handleOpenChange = useCallback(
      (open: boolean) => {
        if (!editor || !canToggle) return
        setIsOpen(open)
        onOpenChange?.(open)
      },
      [canToggle, editor, onOpenChange]
    )

    if (!isVisible) {
      return null
    }

    return (
      <DropdownMenu
        modal
        open={isOpen}
        onOpenChange={handleOpenChange}
      >
        <DropdownMenuTrigger asChild>
          <Button
            type='button'
            data-style='ghost'
            data-active-state={isActive ? 'on' : 'off'}
            role='button'
            tabIndex={-1}
            disabled={!canToggle}
            data-disabled={!canToggle}
            aria-label='Format text as heading'
            aria-pressed={isActive}
            tooltip='Heading'
            {...buttonProps}
            ref={ref}
          >
            <Icon size={16} />
            {label && <span className='xt-button-text'>{label}</span>}
            <ChevronDown
              size={14}
              className='arrow-transform'
              style={{
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align='start'
          portal={portal}
        >
          <Card>
            <CardBody>
              <ButtonGroup>
                {levels.map((level) => (
                  <DropdownMenuItem
                    key={`heading-${level}`}
                    asChild
                  >
                    <HeadingButton
                      editor={editor}
                      level={level}
                      text={`标题 ${level}`}
                      showTooltip={false}
                      showShortcut={true}
                    />
                  </DropdownMenuItem>
                ))}
              </ButtonGroup>
            </CardBody>
          </Card>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
)

HeadingDropdownMenu.displayName = 'HeadingDropdownMenu'

export default HeadingDropdownMenu
