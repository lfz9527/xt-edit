import { type Editor } from '@tiptap/react'
import { useCallback, useState } from 'react'

import { ChevronDown } from 'lucide-react'

import { cn } from '@/utils'

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui-primitive/dropdown-menu'

import {
  type ButtonProps,
  Button,
  ButtonGroup,
} from '@/components/ui-primitive/button'
import { Card, CardBody } from '@/components/ui-primitive/card'
import { type ListType, ListButton } from '@/components/ui/list-button'

import { useEditor } from '@/hooks'

import { useListDropdownMenu } from './useListDropdownMenu'

export interface ListDropdownMenuProps extends Omit<ButtonProps, 'type'> {
  /**
   * 编辑器实例
   */
  editor?: Editor
  /**
   * 列表类型
   *  @default ["bulletList", "orderedList", "taskList"]
   */
  types?: ListType[]
  /**
   * 不允许时,是否隐藏
   * @default false
   */
  hideWhenUnavailable?: boolean
  /**
   * 显示变换回调
   */
  onOpenChange?: (isOpen: boolean) => void
  /**
   * 是否挂载在portal
   * @default false
   */
  portal?: boolean
}

export const ListDropdownMenu = ({
  editor: providedEditor,
  types = ['bulletList', 'orderedList', 'taskList'],
  hideWhenUnavailable = false,
  onOpenChange,
  portal = false,
  ...props
}: ListDropdownMenuProps) => {
  const { editor } = useEditor(providedEditor)
  const [isOpen, setIsOpen] = useState(false)

  const { filteredLists, canToggle, isActive, isVisible, Icon, label } =
    useListDropdownMenu({
      editor,
      types,
      hideWhenUnavailable,
    })
  const handleOnOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open)
      onOpenChange?.(open)
    },
    [onOpenChange]
  )

  if (!isVisible) {
    return null
  }

  return (
    <DropdownMenu
      open={isOpen}
      onOpenChange={handleOnOpenChange}
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
          aria-label='List options'
          tooltip='List'
          {...props}
        >
          <Icon size={16} />
          {label && (
            <span
              className='xt-button-text'
              style={{ userSelect: 'none' }}
            >
              {label}
            </span>
          )}
          <ChevronDown
            size={14}
            className={cn('xt-button-arrow-transform', isOpen ? 'active' : '')}
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
              {filteredLists.map((option) => (
                <DropdownMenuItem
                  key={option.type}
                  asChild
                >
                  <ListButton
                    editor={editor}
                    type={option.type}
                    text={option.label}
                    showTooltip={false}
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
