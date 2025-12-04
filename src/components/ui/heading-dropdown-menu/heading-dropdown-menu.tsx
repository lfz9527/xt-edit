import { forwardRef } from 'react'

import { type ButtonProps, Button } from '@/components/ui-primitive/button'

import { type UseHeadingDropdownMenuConfig } from './useHeadingDropdownMenu'

export interface HeadingDropdownMenuProps
  extends Omit<ButtonProps, 'type'>, UseHeadingDropdownMenuConfig {
  /**
   * Whether to render the dropdown menu in a portal
   * @default false
   */
  portal?: boolean
  /**
   * Callback for when the dropdown opens or closes
   */
  onOpenChange?: (isOpen: boolean) => void
}

export const HeadingDropdownMenu = forwardRef<
  HTMLButtonElement,
  HeadingDropdownMenuProps
>(() => {
  // const [isOpen, setIsOpen] = useState<boolean>(false)

  return <Button>223</Button>
})

HeadingDropdownMenu.displayName = 'HeadingDropdownMenu'

export default HeadingDropdownMenu
