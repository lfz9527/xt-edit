import { Spacer } from '@/components/ui-primitive/spacer'
import {
  ToolbarGroup,
  ToolbarSeparator,
} from '@/components/ui-primitive/toolbar'

import { UndoRedoButton } from '@/components/ui/undo-redo-button'
import { HeadingDropdownMenu } from '@/components/ui/heading-dropdown-menu'
import { ListDropdownMenu } from '@/components/ui/list-dropdown-menu'

interface Props {
  onHighlighterClick: () => void
  onLinkClick: () => void
}

export const ToolBarContent = (props: Props) => {
  console.log(props)

  return (
    <>
      <Spacer />
      <ToolbarGroup>
        <UndoRedoButton
          action='undo'
          tooltip='撤销'
          showTooltip
          shortcutKeys='ctrl+z'
          showShortcut
        />
        <UndoRedoButton
          action='redo'
          tooltip='重试'
          showTooltip
          shortcutKeys='shift+ctrl+z'
          showShortcut
        />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <HeadingDropdownMenu
          portal={false}
          tooltip='标题与正文'
          showTooltip
        />
        <ListDropdownMenu
          tooltip='列表'
          showTooltip
          portal={false}
        />
      </ToolbarGroup>

      <Spacer />
    </>
  )
}
