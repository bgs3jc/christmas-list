import { useEffect } from 'react'
import { features } from './config/features'
import { useViewer } from './data'
import { HomePage } from './features/home/HomePage'
import { MyListPage } from './features/my-list/MyListPage'
import { ShoppingPage } from './features/shopping/ShoppingPage'
import { ViewAsBar } from './features/view-as/ViewAsBar'
import { useRoute } from './shared/router'
import { SiteHeader } from './shared/SiteHeader'

export function App() {
  const route = useRoute()
  const viewer = useViewer()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [route])

  let page
  if (route.name === 'shop' && route.personId !== viewer.id) {
    // Keyed so switching person or viewer starts the page fresh.
    page = <ShoppingPage key={`${viewer.id}:${route.personId}`} recipientId={route.personId} />
  } else if (route.name === 'shop' || route.name === 'my-list') {
    // Your own shopping page is just your list: nothing about your gifts.
    page = <MyListPage key={viewer.id} />
  } else {
    page = <HomePage />
  }

  return (
    <>
      {features.viewAsSwitch && <ViewAsBar />}
      <SiteHeader route={route} />
      {page}
    </>
  )
}
