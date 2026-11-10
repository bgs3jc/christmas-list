import { useEffect } from 'react'
import { features } from './config/features'
import { prototype, useSession, useViewer } from './data'
import { HomePage } from './features/home/HomePage'
import { MyListPage } from './features/my-list/MyListPage'
import { SackPage } from './features/sack/SackPage'
import { ShoppingPage } from './features/shopping/ShoppingPage'
import { SignInPage } from './features/sign-in/SignInPage'
import { ViewAsBar } from './features/view-as/ViewAsBar'
import { useRoute } from './shared/router'
import { SiteHeader } from './shared/SiteHeader'

export function App() {
  const session = useSession()
  // Nothing about the family shows until you're signed in and on the list.
  if (session.status !== 'ready') return <SignInPage session={session} />
  return <SignedIn />
}

function SignedIn() {
  const route = useRoute()
  const viewer = useViewer()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [route])

  let page
  let home = false
  if (route.name === 'shop' && route.personId !== viewer.id) {
    // Keyed so switching person or viewer starts the page fresh.
    page = <ShoppingPage key={`${viewer.id}:${route.personId}`} recipientId={route.personId} />
  } else if (route.name === 'sack' && features.santasSack) {
    page = <SackPage key={viewer.id} />
  } else if (route.name === 'shop' || route.name === 'my-list') {
    // Your own shopping page is just your list: nothing about your gifts.
    page = <MyListPage key={viewer.id} />
  } else {
    // Home draws its own header, inside the night sky.
    page = <HomePage route={route} />
    home = true
  }

  return (
    <>
      {prototype && <ViewAsBar />}
      {!home && <SiteHeader route={route} />}
      {page}
    </>
  )
}
