import { cloneElement, forwardRef, isValidElement, version } from 'react'
import {
  FloatingDelayGroup,
  FloatingPortal,
  useMergeRefs,
} from '@floating-ui/react'
import {
  useTooltip,
  useTooltipContext,
  TooltipContext,
  type TooltipProviderProps,
} from './useTooltip'
import './tooltip.less'

export const Tooltip = ({ children, ...props }: TooltipProviderProps) => {
  const tooltip = useTooltip(props)

  if (!props.useDelayGroup) {
    return (
      <TooltipContext.Provider value={tooltip}>
        {children}
      </TooltipContext.Provider>
    )
  }

  return (
    <FloatingDelayGroup
      delay={{ open: props.delay ?? 0, close: props.closeDelay ?? 0 }}
      timeoutMs={props.timeout}
    >
      <TooltipContext.Provider value={tooltip}>
        {children}
      </TooltipContext.Provider>
    </FloatingDelayGroup>
  )
}

interface TooltipTriggerProps extends Omit<
  React.HTMLProps<HTMLElement>,
  'ref'
> {
  asChild?: boolean
  children: React.ReactNode
}

export const TooltipTrigger = forwardRef<HTMLElement, TooltipTriggerProps>(
  ({ children, asChild = false, ...props }, propRef) => {
    const context = useTooltipContext()
    const childrenRef = isValidElement(children)
      ? parseInt(version, 10) >= 19
        ? (children as { props: { ref?: React.Ref<any> } }).props.ref
        : (children as any).ref
      : undefined
    const ref = useMergeRefs([context.refs.setReference, propRef, childrenRef])

    if (asChild && isValidElement(children)) {
      const dataAttributes = {
        'data-tooltip-state': context.open ? 'open' : 'closed',
      }

      return cloneElement(
        children,
        context.getReferenceProps({
          ref,
          ...props,
          ...(typeof children.props === 'object' ? children.props : {}),
          ...dataAttributes,
        })
      )
    }

    return (
      <button
        ref={ref}
        data-tooltip-state={context.open ? 'open' : 'closed'}
        {...context.getReferenceProps(props)}
      >
        {children}
      </button>
    )
  }
)

interface TooltipContentProps extends Omit<
  React.HTMLProps<HTMLDivElement>,
  'ref'
> {
  children?: React.ReactNode
  portal?: boolean
  portalProps?: Omit<React.ComponentProps<typeof FloatingPortal>, 'children'>
}

export const TooltipContent = forwardRef<HTMLDivElement, TooltipContentProps>(
  function TooltipContent(
    { style, children, portal = true, portalProps = {}, ...props },
    propRef
  ) {
    const context = useTooltipContext()
    const ref = useMergeRefs([context.refs.setFloating, propRef])

    if (!context.open) return null

    const content = (
      <div
        ref={ref}
        style={{
          ...context.floatingStyles,
          ...style,
        }}
        {...context.getFloatingProps(props)}
        className='xt-tooltip'
      >
        {children}
      </div>
    )

    if (portal) {
      return <FloatingPortal {...portalProps}>{content}</FloatingPortal>
    }

    return content
  }
)

Tooltip.displayName = 'Tooltip'
TooltipTrigger.displayName = 'TooltipTrigger'
TooltipContent.displayName = 'TooltipContent'
