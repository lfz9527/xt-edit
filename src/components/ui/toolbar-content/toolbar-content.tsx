import { Spacer } from '@components/ui-primitive/spacer'

import { UndoRedoButton } from '@/components/ui/undo-redo-button'

import {
  ToolbarGroup,
  ToolbarSeparator,
} from '@/components/ui-primitive/toolbar'

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
          shortcutKeys='ctrl-z'
          showShortcut
        />
        <UndoRedoButton
          action='redo'
          tooltip='重试'
          showTooltip
          shortcutKeys='shift-ctrl-z'
          showShortcut
        />
      </ToolbarGroup>
      <ToolbarSeparator />

      <Spacer />
    </>
  )
}
