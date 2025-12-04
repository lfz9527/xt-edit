import { useCallback, useRef } from 'react'

// ref类型 只处理 object ref 和 function ref
type UserRef<T> =
  | ((instance: T | null) => void)
  | React.RefObject<T | null>
  | null
  | undefined

function updateRef<T>(ref: NonNullable<UserRef<T>>, value: T | null): void {
  if (typeof ref === 'function') {
    ref(value)
  } else if (ref && typeof ref === 'object' && 'current' in ref) {
    //  安全的给ref 赋值
    ;(ref as { current: T | null }).current = value
  }
}

/**
 *
 * @param libRef 组件内部的ref
 * @param userRef 外部传入的组件的ref
 * @returns
 */
function useComposedRef<T extends HTMLElement>(
  libRef: React.RefObject<T | null>,
  userRef: UserRef<T>
) {
  const prevUserRef = useRef<UserRef<T>>(null)

  return useCallback(
    (instance: T | null) => {
      if (libRef && 'current' in libRef) {
        ;(libRef as { current: T | null }).current = instance
      }

      if (prevUserRef.current) {
        updateRef(prevUserRef.current, null)
      }

      prevUserRef.current = userRef

      if (userRef) {
        updateRef(userRef, instance)
      }
    },
    [libRef, userRef]
  )
}

export default useComposedRef
