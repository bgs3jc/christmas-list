// Page addresses use "#/..." because GitHub Pages can't serve paths like /list/allie.

import { useMemo, useSyncExternalStore } from 'react'

export type Route = { name: 'home' } | { name: 'my-list' } | { name: 'shop'; personId: string }

export const links = {
  home: '#/',
  myList: '#/my-list',
  shop: (personId: string) => `#/shop/${personId}`,
}

function parse(hash: string): Route {
  const [page, id] = hash.replace(/^#\/?/, '').split('/')
  if (page === 'my-list') return { name: 'my-list' }
  if (page === 'shop' && id) return { name: 'shop', personId: id }
  return { name: 'home' }
}

function subscribe(listener: () => void) {
  window.addEventListener('hashchange', listener)
  return () => window.removeEventListener('hashchange', listener)
}

export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash)
  return useMemo(() => parse(hash), [hash])
}
