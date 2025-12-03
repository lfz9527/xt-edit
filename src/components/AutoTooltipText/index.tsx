import { useEffect, useRef, useState } from 'react'

interface AutoTooltipTextProps {
  text: string
  className?: string
}

export default function AutoTooltipText({
  text,
  className = '',
}: AutoTooltipTextProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [overflow, setOverflow] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const checkOverflow = () => {
      const isOverflow = el.scrollWidth > el.clientWidth
      setOverflow((prev) => (prev !== isOverflow ? isOverflow : prev))
    }

    // 初始化检查
    checkOverflow()

    // 使用 ResizeObserver → 同步监听宽度变化 + 字体变化 + 内容变化
    const ro = new ResizeObserver(() => checkOverflow())
    ro.observe(el)

    return () => ro.disconnect()
  }, [text])

  return (
    <div
      ref={ref}
      className={`truncate ${className}`}
      title={overflow ? text : ''}
    >
      {text}
    </div>
  )
}
