// The shapes of everything the app stores. Firebase (M4) stores the same shapes.

export type PersonId = string

export type SantasListStatus = 'nice' | 'fence' | 'naughty'

export interface Person {
  id: PersonId
  name: string
  // A family joke. Brady sets it in the data; nobody changes it on the site.
  santasList?: SantasListStatus
}

// 'specific' is the "Gimme, gimme, gimme" kind: one exact thing, claimed once.
// 'maybe' is a store, brand or kind of thing: several people can each add a gift under it.
export type WishKind = 'specific' | 'maybe'

export interface WishItem {
  id: string
  ownerId: PersonId
  kind: WishKind
  title: string
  link?: string
  // Never typed by the owner. Reserved for prices pulled from links later.
  price?: string
  notes?: string
  topPick: boolean
  order: number
  createdAt: string
}

export type GiftStatus = 'planned' | 'bought' | 'wrapped'

// Under the tree, or in the stocking (opened separately).
export type GiftPlace = 'tree' | 'stocking'

export interface Gift {
  id: string
  recipientId: PersonId
  giverId: PersonId
  title: string
  // Set when the gift comes from the recipient's list. Empty for surprises.
  wishItemId?: string
  price?: string
  notes?: string
  status: GiftStatus
  place: GiftPlace
  createdAt: string
  updatedAt: string
  updatedBy: PersonId
}

// Something overheard about a person, saved for later.
export interface Idea {
  id: string
  aboutId: PersonId
  authorId: PersonId
  text: string
  createdAt: string
  madeIntoGift?: boolean
}

export interface AppData {
  people: Person[]
  wishes: WishItem[]
  gifts: Gift[]
  ideas: Idea[]
  // When each person last opened each shopping page, keyed "viewer:recipient".
  lastSeen: Record<string, string>
}
