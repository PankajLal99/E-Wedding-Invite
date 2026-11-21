import { useRef, useEffect } from 'react'

export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const show = (el: Element) => el.classList.add('visible')

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) show(entry.target)
        })
      },
      { threshold: 0.05, rootMargin: '0px 0px -24px 0px' }
    )

    const watch = (el: Element) => {
      if (!el.classList.contains('reveal') || el.classList.contains('visible')) return
      if (reduced) {
        show(el)
        return
      }
      observer.observe(el)
    }

    const watchTree = (el: Element) => {
      watch(el)
      el.querySelectorAll('.reveal').forEach(watch)
    }

    watchTree(root)

    const added = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element) watchTree(node)
        })
      })
    })
    added.observe(root, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      added.disconnect()
    }
  }, [])

  return ref
}
