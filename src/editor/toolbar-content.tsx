import { Spacer } from '@components/ui-primitive/spacer'
import { UndoRedoButton } from '@/components/ui/undo-redo-button'
import { ToolbarGroup } from '@/components/ui-primitive/toolbar'

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
        <UndoRedoButton action='undo' />
        <UndoRedoButton action='redo' />
      </ToolbarGroup>

      <Spacer />
    </>
  )
}
