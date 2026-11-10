// The pictures that can go inside a snow globe. The pictures live here in the
// code; which person gets which is data: `globeScene: "two-cats"` on a person
// in the database (or the sample data).

import quarterback from './quarterback.webp'
import swordsman from './swordsman.webp'
import tabby from './tabby.webp'
import twoCats from './two-cats.webp'

const scenes: Record<string, string> = {
  'two-cats': twoCats,
  tabby,
  quarterback,
  swordsman,
}

// The picture for a scene name, or nothing if the name isn't one we have.
export function globeSceneUrl(name: string | undefined): string | undefined {
  return name ? scenes[name] : undefined
}
