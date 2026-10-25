import { features } from './config/features'
import { ComingSoon } from './features/coming-soon/ComingSoon'

export function App() {
  if (features.comingSoon) {
    return <ComingSoon />
  }
  return null
}
