import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  type Placement,
  type UseFloatingReturn,
  type ReferenceType,
} from '@floating-ui/react'
import { useState, useMemo, createContext, useContext } from 'react'

export interface TooltipProviderProps {
  children: React.ReactNode
  // 初始化状态
  initialOpen?: boolean
  // 方向
  placement?: Placement
  // 状态
  open?: boolean
  onOpenChange?: (open: boolean) => void
  delay?: number
  closeDelay?: number
  timeout?: number
  useDelayGroup?: boolean
}

interface TooltipContextValue extends UseFloatingReturn<ReferenceType> {
  open: boolean
  setOpen: (open: boolean) => void
  getReferenceProps: (
    userProps?: React.HTMLProps<HTMLElement>
  ) => Record<string, unknown>
  getFloatingProps: (
    userProps?: React.HTMLProps<HTMLDivElement>
  ) => Record<string, unknown>
}

export const TooltipContext = createContext<TooltipContextValue | null>(null)

export function useTooltipContext() {
  const context = useContext(TooltipContext)
  if (context == null) {
    throw new Error('Tooltip components must be wrapped in <TooltipProvider />')
  }
  return context
}

export function useTooltip({
  initialOpen = false,
  placement = 'top',
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  delay = 600,
  closeDelay = 0,
}: Omit<TooltipProviderProps, 'children'> = {}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState<boolean>(initialOpen)
  const open = controlledOpen ?? uncontrolledOpen
  const setOpen = setControlledOpen ?? setUncontrolledOpen

  const data = useFloating({
    placement,
    open,
    onOpenChange: setOpen,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(4),
      flip({
        crossAxis: placement.includes('-'),
        fallbackAxisSideDirection: 'start',
        padding: 4,
      }),
      shift({ padding: 4 }),
    ],
  })

  const context = data.context

  const hover = useHover(context, {
    mouseOnly: true,
    move: false,
    restMs: delay,
    enabled: controlledOpen == null,
    delay: {
      close: closeDelay,
    },
  })
  const focus = useFocus(context, {
    enabled: controlledOpen == null,
  })
  const dismiss = useDismiss(context)
  const role = useRole(context, { role: 'tooltip' })

  const interactions = useInteractions([hover, focus, dismiss, role])

  return useMemo(
    () => ({
      open,
      setOpen,
      ...interactions,
      ...data,
    }),
    [open, setOpen, interactions, data]
  )
}
